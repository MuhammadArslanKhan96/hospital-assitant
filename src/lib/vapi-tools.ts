// Dynamic Tool Generators

export const VAPI_TOOLS = [
  {
    type: "function",
    function: {
      name: "check_availability",
      description: "Check if a time slot is available for an appointment.",
      parameters: {
        type: "object",
        properties: {
          startTime: {
            type: "string",
            description: "ISO 8601 formatted start time"
          },
          endTime: {
            type: "string",
            description: "ISO 8601 formatted end time"
          },
          timezone: {
            type: "string",
            description: "The caller's timezone (e.g. 'America/Chicago'). Default to 'America/Chicago' if not provided."
          }
        },
        required: ["startTime", "endTime"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cancel_appointment",
      description: "Cancel an existing appointment.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string", description: "The phone number associated with the appointment" },
          date: { type: "string", description: "ISO 8601 formatted date of the appointment to cancel" }
        },
        required: ["phone", "date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "reschedule_appointment",
      description: "Reschedule an existing appointment to a new time.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string", description: "The phone number associated with the appointment" },
          oldDate: { type: "string", description: "ISO 8601 formatted date of the original appointment" },
          newStartTime: { type: "string", description: "ISO 8601 formatted start time for the new appointment" },
          newEndTime: { type: "string", description: "ISO 8601 formatted end time for the new appointment" }
        },
        required: ["phone", "oldDate", "newStartTime", "newEndTime"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "record_contact_preferences",
      description: "Use this tool at the end of the call to record whether the user consents to receiving SMS texts, OR immediately if the user asks to be placed on a Do Not Call list.",
      parameters: {
        type: "object",
        properties: {
          preferred_number: {
            type: "string",
            description: "The number they want to use for texts, formatted in E.164."
          },
          sms_consent: {
            type: "boolean",
            description: "True if they agreed to texts, false if they declined."
          },
          dnc_requested: {
            type: "boolean",
            description: "True if the user explicitly asked to not be called again, otherwise false."
          },
          call_context: {
            type: "string",
            description: "A brief 1-2 sentence summary of the interaction to provide context to the dashboard."
          }
        },
        required: ["sms_consent", "dnc_requested", "call_context"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Book an appointment for the caller.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: {
            type: "string",
            description: "The caller's email. Ask for this gently if not provided."
          },
          phone: { type: "string" },
          startTime: { type: "string" },
          endTime: { type: "string" },
          purpose: { type: "string" },
          timezone: {
            type: "string",
            description: "The caller's timezone. Ask gently. Default to 'US/Central' if unknown."
          }
        },
        required: ["startTime", "endTime"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "capture_lead",
      description: "Capture lead details if they are interested but not booking yet.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          purpose: { type: "string" },
          callback_time: { type: "string" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "log_call",
      description: "Log the outcome of the call.",
      parameters: {
        type: "object",
        properties: {
          intent: { type: "string" },
          status: { type: "string" },
          purpose: { type: "string" },
          summary: { type: "string" },
          caller_name: { type: "string" }
        },
        required: []
      }
    }
  },
  {
    type: "endCall",
    function: {
      name: "end_call",
      description: "Ends the call. Use this to hang up the phone after leaving a voicemail, or when the conversation is fully concluded and the user has said goodbye."
    },
    messages: [
      {
        type: "request-complete",
        content: "Hanging up now. Goodbye!"
      }
    ]
  },
  {
    type: "function",
    function: {
      name: "get_customer_context",
      description: "Retrieve historical context about this caller, including previous interactions, booked appointments, and summaries of past calls. Use this at the start of the call if the user seems like a returning customer.",
      parameters: {
        type: "object",
        properties: {
          customerNumber: {
            type: "string",
            description: "The E.164 phone number of the customer."
          }
        },
        required: ["customerNumber"]
      }
    },
    messages: [
      {
        type: "request-start",
        content: ""
      }
    ]
  }
];

export const generateTransferTool = (targets: { label: string, number: string }[]) => {
    if (!targets || targets.length === 0) return null;

    const destinations = targets.map(t => {
        // Detect SIP
        if (t.number.startsWith('sip:')) {
            return {
                type: "sip",
                sipUri: t.number,
                description: `${t.label} number, transfer to this number when you need to transfer to ${t.label}`
            };
        } else {
             // Basic sanitization for PSTN (E.164)
             let cleanNumber = t.number.replace(/[^\d+]/g, '');
             if (!cleanNumber.startsWith('+')) {
                 if (cleanNumber.length === 10) cleanNumber = '+1' + cleanNumber;
                 else if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) cleanNumber = '+' + cleanNumber;
                 else cleanNumber = '+' + cleanNumber;
             }

             return {
                 type: "number",
                 number: cleanNumber,
                 description: `${t.label} number, transfer to this number when you need to transfer to ${t.label}`,
                 numberE164CheckEnabled: true
             };
        }
    });

    return {
        type: "transferCall",
        function: {
            name: "transfer_call_tool"
        },
        messages: [
            {
                type: "request-start",
                content: "Transferring you now, please hold.",
                blocking: false
            }
        ],
        destinations: destinations
    };
};
