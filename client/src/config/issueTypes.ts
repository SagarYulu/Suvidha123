
export interface IssueSubType {
  id: string;
  label: string;
  labelHindi?: string;
}

export interface IssueType {
  id: string;
  label: string;
  labelHindi?: string;
  subTypes: IssueSubType[];
}

export const ISSUE_TYPES: IssueType[] = [
  {
    id: "salary",
    label: "Salary Issue",
    labelHindi: "सैलरी से जुड़ी परेशानी",
    subTypes: [
      { id: "salary-not-received", label: "Didn't receive the salary", labelHindi: "सैलरी नहीं मिली" },
      { id: "less-salary", label: "Received less salary", labelHindi: "कम सैलरी मिली" },
      { id: "lop-incorrect", label: "Marked LOP incorrectly", labelHindi: "गलत तरीके से LOP लगा दिया गया" },
      { id: "no-incentives", label: "Didn't receive incentives", labelHindi: "इंसेंटिव नहीं मिले" },
      { id: "no-ot", label: "Not received OT", labelHindi: "ओवरटाइम का पैसा नहीं मिला" },
      { id: "no-payslip", label: "Didn't receive payslip", labelHindi: "पेस्लिप नहीं मिली" },
      { id: "salary-advance", label: "Need salary advance", labelHindi: "सैलरी एडवांस चाहिए" },
      { id: "increment-not-happened", label: "Increment not happened", labelHindi: "इनक्रीमेंट नहीं हुआ" },
      { id: "increment-when", label: "When will I get increment", labelHindi: "इनक्रीमेंट कब मिलेगा" },
    ]
  },
  {
    id: "pf",
    label: "PF",
    labelHindi: "पीएफ", // Updated based on image
    subTypes: [
      { id: "bank-kyc", label: "Bank KYC approval", labelHindi: "बैंक केवाईसी अप्रूवल" },
      { id: "name-change", label: "Name change approval", labelHindi: "नाम बदलने का अप्रूवल" },
      { id: "advance-request", label: "Advance request approval", labelHindi: "एडवांस रिक्वेस्ट का अप्रूवल" },
      { id: "pf-transfer", label: "PF transfer approval", labelHindi: "पीएफ ट्रांसफर अप्रूवल" },
      { id: "nominee-details", label: "Nominee details approval", labelHindi: "नॉमिनी डिटेल्स अप्रूवल" },
      { id: "uan-activation", label: "UAN Activation", labelHindi: "यूएएन एक्टिवेशन" },
      { id: "need-uan-number", label: "Need UAN Number", labelHindi: "यूएएन नंबर चाहिए" },
    ]
  },
  {
    id: "esi",
    label: "ESI",
    labelHindi: "ईएसआई", // Updated based on image
    subTypes: [
      { id: "family-addition", label: "Family members addition", labelHindi: "परिवार के सदस्यों को जोड़ना" },
      { id: "nominee-change", label: "Need to change nominee", labelHindi: "नॉमिनी बदलना है" },
      { id: "name-change", label: "Need to change name", labelHindi: "नाम बदलना है" },
      { id: "change-personal-details", label: "Need to change Name/Phone Number/Date of Birth/Address", labelHindi: "नाम/फोन नंबर/जन्म तिथि/पता बदलना है" },
    ]
  },
  {
    id: "leave",
    label: "Leave / Rest Days",
    labelHindi: "छुट्टी", // Updated based on image
    subTypes: [
      { id: "manager-rejected", label: "Manager rejected leave / rest day", labelHindi: "मैनेजर ने छुट्टी / आराम का दिन रिजेक्ट कर दिया" },
      { id: "not-added", label: "Leave / rest day not added", labelHindi: "छुट्टी / आराम का दिन नहीं जोड़ा गया" },
    ]
  },
  {
    id: "manager",
    label: "Manager / Cluster executive Issue",
    labelHindi: "मैनेजर / क्लस्टर एग्जीक्यूटिव से जुड़ी परेशानी",
    subTypes: []
  },
  {
    id: "facility",
    label: "Facility issue",
    labelHindi: "सुविधा से जुड़ी समस्या",
    subTypes: [
      { id: "no-water", label: "Water not available at workshop / YC", labelHindi: "वर्कशॉप / YC पर पानी उपलब्ध नहीं है" },
      { id: "washroom-hygiene", label: "Washrooms hygiene is not maintained", labelHindi: "वॉशरूम की सफाई नहीं रखी जाती" },
    ]
  },
  {
    id: "coworker",
    label: "Co-worker issue",
    labelHindi: "सहकर्मी से जुड़ी समस्या",
    subTypes: [
      { id: "abusing", label: "Abusing", labelHindi: "गाली-गलौज" },
      { id: "threatening", label: "Threatening", labelHindi: "धमकी देना" },
      { id: "manhandled", label: "Manhandled", labelHindi: "मारपीट" },
    ]
  },
  {
    id: "personal",
    label: "Personal Details change",
    labelHindi: "पर्सनल इन्फॉर्मेशन अपडेट", // Updated based on image
    subTypes: [
      { id: "bank-account", label: "Bank Account", labelHindi: "बैंक अकाउंट" },
      { id: "email-id", label: "Email ID", labelHindi: "ईमेल आईडी" },
      { id: "phone-number", label: "Phone Number", labelHindi: "फोन नंबर" },
    ]
  },
  {
    id: "others",
    label: "Others",
    labelHindi: "अन्य समस्या",
    subTypes: [
      { id: "general-query", label: "General Query", labelHindi: "सामान्य प्रश्न" },
      { id: "it-issue", label: "IT Related Issue", labelHindi: "आईटी संबंधित समस्या" },
      { id: "other-issue", label: "Other Issue", labelHindi: "अन्य समस्या" },
    ]
  },
];
