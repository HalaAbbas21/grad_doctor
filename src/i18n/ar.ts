import { DEPARTMENT_LABELS_AR } from "@/constants/departments";
import type {
  Caregiver,
  CaregiverEducation,
  ConsultationType,
  ConsultRequestStatus,
  Gender,
  LabPriority,
  LabRequestStatus,
  LifeStatus,
  Nationality,
  NotificationType,
  PatientQueueStatus,
  ProfessionalStatus,
  StageStatus,
} from "@/mock/types";

/** Central Arabic UI dictionary (§11 glossary). All strings live here for easy review. */
export const t = {
  appName: "بسمة",
  appTagline: "منصّة أورام الأطفال",
  doctorApp: "تطبيق الطبيب",

  nav: {
    dashboard: "الرئيسية",
    patients: "المرضى",
    labs: "المخبر",
    notifications: "الإشعارات",
    profile: "حسابي",
  },

  common: {
    search: "بحث",
    searchByFileNo: "ابحث برقم الإضبارة…",
    fileNo: "رقم الإضبارة",
    fileNoBiruni: "رقم البيروني",
    name: "الاسم",
    age: "العمر",
    years: "سنة",
    gender: "الجنس",
    diagnosis: "التشخيص",
    phase: "المرحلة الحالية",
    status: "الحالة",
    waitingTime: "مدة الانتظار",
    token: "الدور",
    open: "فتح",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    save: "حفظ",
    saveDraft: "حفظ كمسودة",
    saveSubmit: "حفظ وتقديم",
    saved: "تم الحفظ",
    cancel: "إلغاء",
    confirm: "تأكيد",
    add: "إضافة",
    remove: "حذف",
    edit: "تعديل",
    view: "عرض",
    download: "تنزيل",
    print: "طباعة",
    department: "القسم",
    date: "التاريخ",
    time: "الوقت",
    type: "النوع",
    notes: "ملاحظات",
    required: "إلزامي",
    optional: "اختياري",
    loading: "جارٍ التحميل…",
    retry: "إعادة المحاولة",
    today: "اليوم",
    logout: "تسجيل الخروج",
    of: "من",
    step: "الخطوة",
    all: "الكل",
    none: "لا شيء",
  },

  login: {
    title: "تسجيل الدخول",
    subtitle: "منصّة بسمة لأورام الأطفال — تطبيق الطبيب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "دخول",
    biometric: "الدخول بالبصمة",
    pin: "إدخال الرمز السري",
    lockout: "تم تجاوز عدد المحاولات. حاول بعد دقيقة.",
    hint: "أدخل بيانات حسابك في نظام بسمة.",
    notDoctorAccount: "هذا الحساب ليس حساب طبيب",
  },

  departments: {
    title: "اختر القسم",
    subtitle: "حدّد قسم العمل لهذه المناوبة",
    switch: "تغيير القسم",
    clinic: "العيادة",
    daycare: "القسم النهاري",
    inpatient: "القسم الداخلي",
    clinicDesc: "مرضى جدد ومتابعات العيادة",
    daycareDesc: "مرضى الجرعات اليومية",
    inpatientDesc: "المرضى المنوّمون",
    patientsToday: "مرضى اليوم",
  },

  dashboard: {
    greeting: "مرحباً د.",
    activeDepartment: "القسم الفعّال",
    priorityTitle: "ما الذي يحتاج انتباهك الآن؟",
    resultsToReview: "نتائج بانتظار المراجعة",
    dosesToApprove: "جرعات بانتظار الإقرار",
    incompleteDrafts: "مسودات غير مكتملة",
    pendingDischarge: "تقارير تخريج معلّقة",
    newExternalResults: "نتائج جديدة من مخابر خارجية",
    pendingConsults: "طلبات استشارة بانتظار التنسيق",
    todayQueue: "قائمة اليوم",
    todayAppointments: "مواعيد اليوم",
    completeAppointment: "إتمام الموعد",
    notificationsFeed: "آخر الإشعارات",
    viewAll: "عرض الكل",
    allClear: "لا يوجد ما يتطلب انتباهك الآن ✅",
  },

  patient: {
    record: "ملف المريض",
    overview: "نظرة عامة",
    demographics: "المعلومات السكانية",
    documentation: "توثيق المرض",
    plan: "خطة العلاج",
    labs: "التحاليل",
    consultRequests: "طلبات الاستشارة",
    consultationNeeds: "احتياجات الاستشارة",
    vitals: "العلامات الحيوية",
    notes: "الملاحظات",
    discharge: "تقارير التخريج",
    appointments: "المواعيد",
    lifeStatus: "الحالة الحياتية",
    criticalFlags: "تنبيهات حرجة",
    guardianContact: "تواصل مع ولي الأمر",
    partialRegistration: "تسجيل غير مكتمل",
    noPatientsInDepartment: "لا يوجد مرضى",
    noPatientsMatching: "لا يوجد مرضى مطابقون",
    adjustSearch: "جرّب تعديل كلمة البحث.",
    actions: {
      requestLab: "طلب فحص",
      reviewResults: "مراجعة النتائج",
      approveDose: "إقرار الجرعة",
      document: "توثيق المرض",
      plan: "خطة العلاج",
      discharge: "تقرير تخريج",
      setDestination: "تحديد الوجهة",
      addNote: "إضافة ملاحظة",
    },
  },

  labs: {
    request: "طلب فحص مخبري",
    targetLab: "المخبر المستهدف",
    internal: "مخبر داخلي",
    external: "مخبر خارجي",
    testTypes: "أنواع الفحوص",
    indication: "الاستطباب السريري",
    priority: "الأولوية",
    dateRequired: "التاريخ المطلوب",
    submit: "إرسال الطلب",
    results: "النتائج",
    reviewResults: "مراجعة نتائج المختبر",
    pdfView: "عرض الـ PDF",
    externalNote: "تصل نتائج المخابر الخارجية عبر إشعار.",
    markReviewed: "مراجعة النتيجة",
    reviewed: "تمت المراجعة",
    notReviewed: "بانتظار المراجعة",
    failDownloadToggle: "محاكاة فشل التنزيل",
    preDose: "قبل الجرعة",
    pdfAvailable: "PDF متوفر",
    empty: "لا توجد تحاليل",
  },

  consult: {
    title: "طلبات الاستشارة",
    pendingCount: "استشارات بانتظار التنسيق",
    type: "نوع الاستشارة",
    requestNotes: "ملاحظات الطلب",
    requestDate: "تاريخ الطلب",
    coordinate: "تنسيق الاستشارة",
    coordinateConfirm: "سيتم تعليم هذه الاستشارة كمنسّقة.",
    coordinated: "تم التنسيق",
    pending: "بانتظار التنسيق",
    empty: "لا توجد طلبات استشارة بانتظار التنسيق ✅",
    searchByFileNo: "ابحث برقم الإضبارة…",
    filterByType: "نوع الاستشارة",
    filterByStatus: "الحالة",
  },

  dose: {
    title: "إقرار الجرعة",
    approve: "إقرار الجرعة",
    prepareStep: "تحضير الإقرار",
    approveStep: "إقرار الجرعة",
    selectReviewedLab: "اختر التحليل المُراجَع",
    noEligibleLab: "لا يوجد تحليل مُراجَع لهذا المريض — راجع نتيجة تحليل أولاً",
    context: "سياق القرار",
    protocolStage: "مرحلة البروتوكول",
    preDoseLab: "نتيجة ما قبل الجرعة",
    recommended: "الجرعة الموصى بها حسب البروتوكول",
    approvedDose: "الجرعة المُقرّة",
    route: "طريق الإعطاء",
    approvedStatus: "تم الإقرار",
    readyForNurse: "جاهزة للإعطاء من الممرضة",
    cycle: "الدورة",
    adjustedFromRecommended: "تم تعديل الجرعة عن الجرعة الموصى بها.",
    noRecommendation: "لا توجد جرعة موصى بها لهذه الحالة — أدخل الجرعة المعتمدة يدوياً",
  },

  vitals: {
    latest: "أحدث قراءة",
    history: "السجل",
    empty: "لا توجد علامات حيوية",
    weight: "الوزن",
    height: "الطول",
    temperature: "الحرارة",
    pulse: "النبض",
    bloodPressure: "ضغط الدم",
    respiratoryRate: "معدل التنفس",
    oxygenSaturation: "تشبع الأكسجين",
    painScore: "شدة الألم",
  },

  plan: {
    builder: "بناء خطة العلاج",
    planName: "اسم الخطة",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء المتوقع",
    description: "وصف عام",
    stages: "المراحل",
    addStage: "إضافة مرحلة",
    stageName: "اسم المرحلة",
    medications: "الأدوية",
    addMed: "إضافة دواء",
    medName: "اسم الدواء",
    dose: "الجرعة",
    schedule: "الجدول",
    procedures: "الإجراءات",
    cycles: "عدد الدورات",
    visits: "عدد الزيارات",
    milestones: "المعالم",
    timeline: "المخطط الزمني للمراحل",
    chronoError: "يجب أن تكون المراحل مرتبة زمنياً.",
    presetStages: ["مرحلة الحث", "مرحلة التوحيد", "مرحلة الصيانة"],
    custom: "مرحلة مخصّصة",
  },

  document: {
    title: "توثيق المرض",
    chooseTemplate: "اختر القالب",
    searchTemplate: "ابحث عن قالب…",
    version: "الإصدار",
    progress: "نسبة الإكمال",
    autosaved: "تم الحفظ تلقائياً",
    requiredFields: "حقول إلزامية ناقصة",
    submitSuccess: "تم تقديم التوثيق بنجاح",
  },

  discharge: {
    title: "تقرير التخريج",
    new: "تقرير تخريج جديد",
    lastDoseDate: "تاريخ آخر جرعة",
    prescription: "الوصفة الطبية",
    addMed: "إضافة دواء",
    med: "الدواء",
    dose: "الجرعة",
    instructions: "التعليمات",
    doctorInstructions: "تعليمات الطبيب",
    nextDoseDate: "موعد الجرعة القادمة",
    nextDestination: "الوجهة القادمة",
    generate: "إنشاء التقرير",
    preview: "معاينة التقرير",
    generated: "تم إنشاء تقرير التخريج 🎉",
    doctorOnly: "تقرير التخريج من صلاحية الطبيب فقط.",
    forFamily: "ما سيطّلع عليه ذوو المريض",
  },

  notifications: {
    title: "الإشعارات",
    markAllRead: "تعليم الكل كمقروء",
    markRead: "تعليم كمقروء",
    empty: "لا توجد إشعارات",
    filterAll: "الكل",
    unread: "غير مقروء",
  },

  profile: {
    title: "حسابي",
    specialization: "الاختصاص",
    professionalStatus: "الصفة المهنية",
    professionalId: "الرقم النقابي",
    contact: "معلومات التواصل",
    securitySettings: "إعدادات الدخول الآمن",
    securityNote: "إدارة الرمز السري والبصمة (قيد التطوير).",
  },
} as const;

// ── Enum → Arabic label maps ──────────────────────────────────────────

export const departmentLabel = DEPARTMENT_LABELS_AR;

export const lifeStatusLabel: Record<LifeStatus, string> = {
  alive: "حياة",
  deceased: "وفاة",
  discontinued: "انقطاع عن العلاج",
  lost: "فقد متابعة",
  unknown: "غير معروفة",
};

export const genderLabel: Record<Gender, string> = { male: "ذكر", female: "أنثى" };

export const nationalityLabel: Record<Nationality, string> = {
  syrian: "سوري",
  syrian_palestinian: "سوري فلسطيني",
  other: "أخرى",
};

export const caregiverLabel: Record<Caregiver, string> = {
  both_parents: "الأب والأم",
  father_only: "الأب فقط",
  mother_only: "الأم فقط",
  grandparent: "الجد أو الجدة",
  relative: "العم/الخال/العمة/الخالة",
  other: "جهة أخرى",
};

export const caregiverEducationLabel: Record<CaregiverEducation, string> = {
  illiterate: "أمّي",
  primary: "ابتدائي",
  preparatory: "إعدادي",
  secondary: "ثانوي",
  university: "جامعي",
};

export const professionalStatusLabel: Record<ProfessionalStatus, string> = {
  specialist: "أخصائي",
  resident: "مقيم",
};

export const priorityLabel: Record<LabPriority, string> = {
  routine: "روتيني",
  urgent: "عاجل",
  emergency: "طارئ",
};

export const labStatusLabel: Record<LabRequestStatus, string> = {
  pending: "معلّق",
  accepted: "مقبول",
  rejected: "مرفوض",
  "results-available": "النتائج متوفرة",
};

export const queueStatusLabel: Record<PatientQueueStatus, string> = {
  "awaiting-lab": "بانتظار التحليل",
  "result-ready": "النتيجة جاهزة",
  "awaiting-dose-approval": "بانتظار إقرار الجرعة",
  "in-treatment": "قيد العلاج",
  completed: "مكتمل",
  critical: "حالة حرجة",
};

export const stageStatusLabel: Record<StageStatus, string> = {
  "in-progress": "قيد التقدم",
  completed: "مكتملة",
  pending: "معلّقة",
};

// TODO(api-contract): only "initial_exam"/"follow_up" (type) and
// "scheduled"/"cancelled"/"completed" (status) have been observed. These are
// partial maps, not exhaustive unions — render sites must fall back to the
// raw value for anything unrecognized (e.g. `appointmentTypeLabel[a.type] ?? a.type`).
export const appointmentTypeLabel: Record<string, string> = {
  initial_exam: "فحص أولي",
  follow_up: "متابعة",
};

export const appointmentStatusLabel: Record<string, string> = {
  scheduled: "مجدول",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغى",
};

// TODO(api-contract): only "served" has been observed; "waiting"/"called"
// are expected but unconfirmed. Fall back to the raw value for anything else
// (e.g. `queueItemStatusLabel[q.status] ?? q.status`).
export const queueItemStatusLabel: Record<string, string> = {
  served: "تمت الخدمة",
  waiting: "بالانتظار",
  called: "تم الاستدعاء",
};

// TODO(api-contract): only "in_progress" has been observed on a treatment
// phase; "completed"/"pending" are expected but unconfirmed. Fall back to the
// raw value for anything else (e.g. `phaseStatusLabel[p.status] ?? p.status`).
export const phaseStatusLabel: Record<string, string> = {
  in_progress: "قيد التنفيذ",
  completed: "مكتملة",
  pending: "قادمة",
};

// TODO(api-contract): only "results_available" has been observed live;
// "pending"/"accepted"/"rejected" exist per the README but are unconfirmed.
// Fall back to the raw value for anything else.
export const labRequestStatusLabel: Record<string, string> = {
  results_available: "النتائج متوفرة",
  pending: "معلّق",
  accepted: "مقبول",
  rejected: "مرفوض",
};

export const notificationTypeLabel: Record<NotificationType, string> = {
  alert: "تنبيه",
  info: "معلومة",
  reminder: "تذكير",
};

export const consultTypeLabel: Record<ConsultationType, string> = {
  cardiac: "قلبية",
  neurological: "عصبية",
  ophthalmic: "عينية",
  ent: "أذنية",
  surgery: "جراحة",
  other: "أخرى",
};

export const consultStatusLabel: Record<ConsultRequestStatus, string> = {
  pending: "بانتظار التنسيق",
  coordinated: "تم التنسيق",
};
