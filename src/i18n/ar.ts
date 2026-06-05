import type {
  AppointmentStatus,
  AppointmentType,
  Caregiver,
  CaregiverEducation,
  Department,
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
    username: "اسم المستخدم",
    password: "كلمة المرور",
    signIn: "دخول",
    biometric: "الدخول بالبصمة",
    pin: "إدخال الرمز السري",
    lockout: "تم تجاوز عدد المحاولات. حاول بعد دقيقة.",
    hint: "استخدم أي بيانات للدخول (نظام تجريبي).",
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
    todayQueue: "قائمة اليوم",
    todayAppointments: "مواعيد اليوم",
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
    vitals: "العلامات الحيوية",
    notes: "الملاحظات",
    discharge: "تقارير التخريج",
    appointments: "المواعيد",
    lifeStatus: "الحالة الحياتية",
    criticalFlags: "تنبيهات حرجة",
    guardianContact: "تواصل مع ولي الأمر",
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
    markReviewed: "تمت المراجعة",
    reviewed: "تمت المراجعة",
    notReviewed: "بانتظار المراجعة",
    failDownloadToggle: "محاكاة فشل التنزيل",
  },

  dose: {
    title: "إقرار الجرعة",
    protocolStage: "مرحلة البروتوكول",
    lastDose: "تاريخ آخر جرعة",
    cycle: "الدورة / الزيارة",
    preDoseLab: "نتيجة ما قبل الجرعة",
    recommended: "الجرعة الموصى بها حسب البروتوكول",
    approve: "إقرار الجرعة",
    modify: "تعديل الجرعة",
    approvedDose: "الجرعة المُقرّة",
    reason: "سبب التعديل",
    sendToNurse: "إرسال إلى الممرضة",
    blocked: "لا يمكن الإقرار قبل مراجعة نتيجة مخبرية حديثة.",
    needsReview: "يجب مراجعة النتيجة المخبرية أولاً قبل إقرار الجرعة.",
    sentStatus: "بانتظار إعطاء الجرعة",
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

export const departmentLabel: Record<Department, string> = {
  clinic: "العيادة",
  daycare: "القسم النهاري",
  inpatient: "القسم الداخلي",
};

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

export const appointmentTypeLabel: Record<AppointmentType, string> = {
  "follow-up": "متابعة",
  initial: "فحص أولي",
};

export const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  scheduled: "مجدول",
  "checked-in": "تم الحضور",
  done: "منتهٍ",
  missed: "فائت",
};

export const notificationTypeLabel: Record<NotificationType, string> = {
  alert: "تنبيه",
  info: "معلومة",
  reminder: "تذكير",
};
