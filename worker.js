const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
const CORS={"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,PUT,DELETE,OPTIONS","access-control-allow-headers":"content-type,x-admin-password"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...CORS}});
function suppliedPassword(request){return request.headers.get("x-admin-password") ?? "";}
function configuredPassword(env){return typeof env.ADMIN_PASSWORD === "string" ? env.ADMIN_PASSWORD.trim() : "";}
function isAdmin(request,env){const supplied=suppliedPassword(request);const configured=configuredPassword(env);return Boolean(configured)&&supplied===configured;}
async function parsePost(request){const b=await request.json();if(!b.title||!b.category||!b.section)throw new Error("Название и категория обязательны.");return{title:String(b.title).trim().slice(0,200),category:String(b.category).trim().slice(0,100),section:String(b.section),excerpt:String(b.excerpt||"").slice(0,2000),image:String(b.image||"").slice(0,3000),blocks:Array.isArray(b.blocks)?b.blocks.slice(0,40).map(x=>({type:String(x.type||"text"),heading:String(x.heading||"").slice(0,200),text:String(x.text||"").slice(0,30000),image:String(x.image||"").slice(0,3000),caption:String(x.caption||"").slice(0,500)})):[]};}
async function posts(request,env){const u=new URL(request.url);const section=u.searchParams.get("section");const q=section?env.DB.prepare("SELECT * FROM posts WHERE section=? ORDER BY created_at DESC"):env.DB.prepare("SELECT * FROM posts ORDER BY created_at DESC");const r=section?await q.bind(section).all():await q.all();return json((r.results||[]).map(p=>({...p,blocks:JSON.parse(p.blocks||"[]")})));}
export default {async fetch(request,env){if(request.method==="OPTIONS")return new Response(null,{headers:CORS});const u=new URL(request.url);
if(u.pathname==="/api/admin/check"&&request.method==="POST"){
 const configured=configuredPassword(env); if(!configured)return json({ok:false,error:"ADMIN_PASSWORD_NOT_CONFIGURED"},503);
 if(!isAdmin(request,env))return json({ok:false,error:"INVALID_PASSWORD"},401); return json({ok:true});
}
if(u.pathname==="/api/admin/status"&&request.method==="GET")return json({configured:Boolean(configuredPassword(env))});
if(u.pathname==="/api/posts"&&request.method==="GET")return posts(request,env);
if(u.pathname==="/api/posts"&&request.method==="POST"){if(!isAdmin(request,env))return json({error:"Unauthorized"},401);try{const b=await parsePost(request),id=crypto.randomUUID();await env.DB.prepare("INSERT INTO posts(id,title,category,section,excerpt,image,blocks,created_at) VALUES(?,?,?,?,?,?,?,datetime('now'))").bind(id,b.title,b.category,b.section,b.excerpt,b.image,JSON.stringify(b.blocks)).run();return json({ok:true,id});}catch(e){return json({error:e.message},400);}}
if(u.pathname.startsWith("/api/posts/")&&(request.method==="PUT"||request.method==="DELETE")){if(!isAdmin(request,env))return json({error:"Unauthorized"},401);const id=decodeURIComponent(u.pathname.slice("/api/posts/".length));if(request.method==="DELETE"){await env.DB.prepare("DELETE FROM posts WHERE id=?").bind(id).run();return json({ok:true});}try{const b=await parsePost(request);await env.DB.prepare("UPDATE posts SET title=?,category=?,section=?,excerpt=?,image=?,blocks=? WHERE id=?").bind(b.title,b.category,b.section,b.excerpt,b.image,JSON.stringify(b.blocks),id).run();return json({ok:true});}catch(e){return json({error:e.message},400);}}
return env.ASSETS.fetch(request);}}
