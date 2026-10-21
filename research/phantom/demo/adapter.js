/* Display adapter. No scoring, support assignment, inference, or workflow transitions. */
(function (global) {
  'use strict';
  const TIERS = Object.freeze({A:'Tier A — Structural Review', B:'Tier B — Causally Ambiguous Structural Review', C:'Tier C — Supported With Caution', D:'Tier D — Out of Support'});
  const ACTIONS = Object.freeze({'REVIEW STRUCTURAL FINDING':'STANDARD REVIEW','REVIEW CAUSAL ALTERNATIVES AND REQUEST PROVENANCE':'AMBIGUOUS COMMON CAUSE','REVIEW WITH CAUTION':'STANDARD REVIEW','OUT OF SUPPORT':'OUT OF SUPPORT — DO NOT INTERPRET'});
  const AVAILABILITY = Object.freeze({FIELD_AVAILABLE:'AVAILABLE',FIELD_NOT_AVAILABLE:'NOT AVAILABLE IN CURRENT DATA',REVIEW_REQUIRED:'REVIEW REQUIRED',NOT_APPLICABLE:'NOT APPLICABLE'});
  function freeze(x) { if (x && typeof x === 'object' && !Object.isFrozen(x)) { Object.freeze(x); Object.values(x).forEach(freeze); } return x; }
  function action(candidate) { if (!Object.hasOwn(ACTIONS,candidate.recommended_action)) throw Error('Unknown source action; presentation withheld.'); return ACTIONS[candidate.recommended_action]; }
  function groups(index, filters={}) {
    const matches = c => (!filters.tier || c.triage_tier===filters.tier) && (!filters.support || c.support_status===filters.support) && (!filters.source || c.source===filters.source) && (!filters.query || (c.campaign_id+' '+c.source).toLowerCase().includes(filters.query.toLowerCase())) && (!filters.size || c.member_count>=+filters.size) && (!filters.targets || c.target_count>=+filters.targets) && (!filters.strength || c.coordination_values.some(x=>x>=+filters.strength)) && (!filters.ambiguity || (filters.ambiguity==='unresolved' ? c.causal_resolution_status==='CAUSALLY_UNRESOLVED' : c.triage_tier==='B')) && (!filters.provenance || (filters.provenance==='missing' ? c.missing_provenance_count>0 : c.missing_provenance_count===0)) && (!filters.from || c.evidence_period[1]>Date.parse(filters.from)/1000) && (!filters.to || c.evidence_period[0]<Date.parse(filters.to)/1000+86400);
    const output = [];
    for (const g of index.groups) {
      const members = index.candidates.filter(c=>c.run_id===g.run_id && g.member_candidate_ids.includes(c.campaign_id));
      if(members.length!==g.member_count) throw Error('Incomplete frozen equivalence set.');
      if(members.some(matches)) output.push({...g, members, matchCount:members.filter(matches).length, diagnostic:false});
    }
    // D objects have no scientific equivalence or numerical priority.
    for (const c of index.candidates.filter(c=>c.triage_tier==='D' && matches(c))) output.push({source:c.source,run_id:c.run_id,equivalence_set_id:null,triage_tier:'D',members:[c],member_count:1,matchCount:1,diagnostic:true});
    return output;
  }
  const api = {TIERS,ACTIONS,AVAILABILITY,freeze,action,groups};
  if(typeof module!=='undefined') module.exports=api;
  global.PhantomAdapter=api;
})(typeof window!=='undefined'?window:globalThis);
