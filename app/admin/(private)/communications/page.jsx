"use client";

import { useState } from "react";
import { Mail, Send, Settings, FileText, Shield, AlertCircle, CheckCircle2, History } from "lucide-react";
import { Button, Input, Select, Textarea } from "@/components/admin/AdminControls";
import AdminNotice from "@/components/admin/AdminNotice";

// Mock templates for display
const TEMPLATES = [
  { id: "welcome", name: "Welcome Email", subject: "Welcome to SmartKidz!", lastUpdated: "2d ago" },
  { id: "receipt", name: "Subscription Receipt", subject: "Your Receipt", lastUpdated: "1w ago" },
  { id: "weekly_report", name: "Weekly Report", subject: "Your Child's Progress", lastUpdated: "3d ago" },
  { id: "password_reset", name: "Password Reset", subject: "Reset your password", lastUpdated: "1mo ago" },
];

export default function CommunicationsPage() {
  const [tab, setTab] = useState("config"); // config | templates | send | logs
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);

  // Config State
  const [config, setConfig] = useState({
    provider: "resend",
    fromName: "SmartKidz Team",
    fromEmail: "hello@smartkidz.app",
    replyTo: "support@smartkidz.app",
    marketingEnabled: true,
  });

  async function sendTest() {
    if (!testEmail) return;
    setSending(true);
    setNotice(null);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1500));
      setNotice({ tone: "success", title: "Sent", message: `Test email dispatched to ${testEmail}` });
    } catch (e) {
      setNotice({ tone: "danger", title: "Failed", message: "Could not send test email." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-indigo-600" />
          Communications
        </h1>
        <p className="text-slate-500">
          Manage email delivery, templates, and sender identity.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {[
          { id: "config", label: "Configuration", icon: Settings },
          { id: "templates", label: "Templates", icon: FileText },
          { id: "send", label: "Send Tool", icon: Send },
          { id: "logs", label: "Delivery Logs", icon: History },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
              tab === t.id 
                ? "bg-slate-100 text-slate-900 border-b-2 border-slate-900" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {notice && (
        <AdminNotice tone={notice.tone} title={notice.title}>{notice.message}</AdminNotice>
      )}

      {/* CONFIGURATION TAB */}
      {tab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <h3 className="font-bold text-lg text-slate-900 mb-4">Sender Identity</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From Name</label>
                       <Input value={config.fromName} onChange={e => setConfig({...config, fromName: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From Email</label>
                       <Input value={config.fromEmail} onChange={e => setConfig({...config, fromEmail: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reply-To</label>
                       <Input value={config.replyTo} onChange={e => setConfig({...config, replyTo: e.target.value})} />
                    </div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <h3 className="font-bold text-lg text-slate-900 mb-4">Provider</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service</label>
                       <Select value={config.provider} onChange={e => setConfig({...config, provider: e.target.value})}>
                          <option value="resend">Resend (Active)</option>
                          <option value="ses">Amazon SES</option>
                          <option value="sendgrid">SendGrid</option>
                       </Select>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                       <div>
                          <div className="text-sm font-bold text-emerald-800">Domain Verified</div>
                          <div className="text-xs text-emerald-700">SPF, DKIM, and DMARC records are valid.</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-400" /> Compliance & Safety
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <div>
                          <div className="text-sm font-bold text-slate-700">Marketing Emails</div>
                          <div className="text-xs text-slate-500">Allow promotional sends</div>
                       </div>
                       <input 
                         type="checkbox" 
                         className="toggle" 
                         checked={config.marketingEnabled} 
                         onChange={e => setConfig({...config, marketingEnabled: e.target.checked})}
                       />
                    </div>
                    
                    <div className="p-4 rounded-xl border-l-4 border-rose-500 bg-rose-50">
                       <div className="text-sm font-bold text-rose-900">Emergency Stop</div>
                       <div className="text-xs text-rose-700 mb-3">Pause all outbound emails immediately.</div>
                       <Button tone="danger" className="w-full text-xs">Pause All Sending</Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* TEMPLATES TAB */}
      {tab === "templates" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                 <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Last Updated</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {TEMPLATES.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-900">{t.name}</td>
                       <td className="px-6 py-4 text-slate-600">{t.subject}</td>
                       <td className="px-6 py-4 text-slate-500 text-xs">{t.lastUpdated}</td>
                       <td className="px-6 py-4 text-right">
                          <Button tone="secondary" className="mr-2">Edit</Button>
                          <Button tone="ghost">Preview</Button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {/* SEND TOOL */}
      {tab === "send" && (
         <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-xl text-slate-900 mb-6">Send Test / Transactional</h3>
            
            <div className="space-y-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Template</label>
                  <Select>
                     {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Recipient</label>
                  <Input 
                     placeholder="user@example.com" 
                     value={testEmail} 
                     onChange={e => setTestEmail(e.target.value)} 
                  />
               </div>

               <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-sm text-amber-800">
                     <strong>Warning:</strong> This will send a real email. Ensure you have consent or use your own email for testing.
                  </div>
               </div>

               <div className="flex justify-end">
                  <Button onClick={sendTest} disabled={sending || !testEmail} className="w-full sm:w-auto">
                     {sending ? "Sending..." : "Send Email"}
                  </Button>
               </div>
            </div>
         </div>
      )}
      
      {/* LOGS TAB */}
      {tab === "logs" && (
         <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-900 text-lg">No Recent Activity</h3>
            <p className="text-slate-500">Email delivery logs will appear here.</p>
         </div>
      )}

    </div>
  );
}