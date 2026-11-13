// Exercise the actual context buttons and summary controls before editing.
// Existing regression assertions continue to check the same project values.
module.exports=function install(page){
 const rawRole=page.getByRole.bind(page),rawLocator=page.locator.bind(page);
 async function reveal(loc){if(!await loc.count())await loc.first().waitFor({state:'attached'});const first=loc.first();const context=await first.evaluate(el=>el.closest('[data-ui-context]')?.getAttribute('data-ui-context'));if(context){const name={scene:'コマ',layer:'レイヤー',project:'全体'}[context];const contextButton=rawRole('button',{name,exact:true});if(await contextButton.getAttribute('aria-pressed')!=='true')await contextButton.click();}
 const parents=await first.locator('xpath=ancestor::details').all();for(const parent of parents)if(await parent.getAttribute('open')===null){const summary=parent.locator(':scope > summary');if(await summary.isVisible())await summary.click();}
 }
 const actions=new Set(['click','dblclick','fill','selectOption','check','uncheck','setChecked','focus','press','setInputFiles','scrollIntoViewIfNeeded','waitFor']);
 function wrap(loc){return new Proxy(loc,{get(target,key){const value=target[key];if(typeof value!=='function')return value;if(actions.has(key))return async(...args)=>{if(key!=='waitFor'||!['hidden','detached'].includes(args[0]?.state))await reveal(target);return value.apply(target,args);};return (...args)=>{if(key==='getByRole')args[1]={...args[1],includeHidden:true};const result=value.apply(target,args);return result&&typeof result==='object'&&typeof result.locator==='function'?wrap(result):result;};}});}
 page.getByRole=(role,opts)=>wrap(rawRole(role,{...opts,includeHidden:true}));
 for(const name of ['getByLabel','getByText','getByTestId','getByPlaceholder']){const original=page[name].bind(page);page[name]=(...args)=>wrap(original(...args));}page.locator=(...args)=>wrap(rawLocator(...args));return page;
};


