'use client';
import { useState } from 'react';
import { Copy, ChevronDown, ChevronUp, Phone, Globe } from 'lucide-react';

export default function ConnectExternalNumber({ agent }: { agent: any }) {
    const sipUri = agent.vapiAssistantId ? `sip:${agent.vapiAssistantId}@sip.vapi.ai` : "Not Provisioned";
    const phoneNumber = agent.phoneNumber?.number || "No Number Assigned";

    const [openGuide, setOpenGuide] = useState<string | null>(null);

    const toggleGuide = (guide: string) => {
        setOpenGuide(openGuide === guide ? null : guide);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Connect External Numbers
            </h2>
            <p className="text-sm text-gray-600 mb-6">
                Forward calls from your existing business numbers (Google Voice, Ooma, Verizon, etc.) to this AI Agent.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-1 flex items-center">
                        <Phone className="w-4 h-4 mr-2" /> Forward to Phone Number
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">Best for most carriers.</p>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                        <code className="text-sm font-mono text-gray-900">{phoneNumber}</code>
                        <button onClick={() => navigator.clipboard.writeText(phoneNumber)} className="text-blue-600 hover:text-blue-800"><Copy className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-1 flex items-center">
                        <Globe className="w-4 h-4 mr-2" /> Forward to SIP URI
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">Best for VoIP (Ooma, RingCentral).</p>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                        <code className="text-xs font-mono text-gray-900 truncate" title={sipUri}>{sipUri}</code>
                        <button onClick={() => navigator.clipboard.writeText(sipUri)} className="text-blue-600 hover:text-blue-800"><Copy className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b pb-2">Setup Guides</h3>
            <div className="space-y-2">
                {/* Ooma */}
                <div className="border rounded-md">
                    <button onClick={() => toggleGuide('ooma')} className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50">
                        <span className="font-medium text-gray-900">Ooma Office</span>
                        {openGuide === 'ooma' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openGuide === 'ooma' && (
                        <div className="p-3 border-t bg-gray-50 text-sm text-gray-700 space-y-2">
                            <p>1. Log in to Ooma Office Manager.</p>
                            <p>2. Navigate to <strong>Extensions</strong> and select the user/extension.</p>
                            <p>3. Go to <strong>Call Forwarding</strong>.</p>
                            <p>4. Select "Forward to external number".</p>
                            <p>5. Enter the <strong>Agent Phone Number</strong> displayed above.</p>
                            <p className="text-xs text-gray-500 italic">Note: Ooma supports SIP forwarding on Enterprise plans. If available, use the SIP URI for faster connection.</p>
                        </div>
                    )}
                </div>

                {/* Google Voice */}
                <div className="border rounded-md">
                    <button onClick={() => toggleGuide('gvoice')} className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50">
                        <span className="font-medium text-gray-900">Google Voice</span>
                        {openGuide === 'gvoice' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openGuide === 'gvoice' && (
                        <div className="p-3 border-t bg-gray-50 text-sm text-gray-700 space-y-2">
                            <p>1. Open Google Voice Settings.</p>
                            <p>2. Go to <strong>Calls</strong> section.</p>
                            <p>3. Turn on "Call Forwarding".</p>
                            <p>4. Link a new number and enter the <strong>Agent Phone Number</strong>.</p>
                            <p>5. Verify the number (Google will call the Agent; check the logs for the code if needed).</p>
                        </div>
                    )}
                </div>

                {/* Generic Carrier */}
                <div className="border rounded-md">
                    <button onClick={() => toggleGuide('carrier')} className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50">
                        <span className="font-medium text-gray-900">Verizon / AT&T / T-Mobile</span>
                        {openGuide === 'carrier' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openGuide === 'carrier' && (
                        <div className="p-3 border-t bg-gray-50 text-sm text-gray-700 space-y-2">
                            <p>Most carriers support "Immediate Call Forwarding" via dial codes:</p>
                            <p><strong>Verizon/AT&T:</strong> Dial <code>*72</code> followed by the <strong>Agent Phone Number</strong>.</p>
                            <p><strong>T-Mobile:</strong> Dial <code>**21*</code> followed by the Agent Number and <code>#</code>.</p>
                            <p>To disable, usually dial <code>*73</code>.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
