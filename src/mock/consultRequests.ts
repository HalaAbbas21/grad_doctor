import type { ConsultRequest } from "./types";

// NOTE: never read by any screen — consult-requests now calls the real
// GET/PATCH /consult-requests API instead.
export const consultRequests: ConsultRequest[] = [
  {
    id: "cr-1",
    patientFileNo: "B-1042",
    consultationType: "cardiac",
    notes: "تقييم وظيفة القلب قبل بدء بروتوكول علاج كيميائي قلبي السمّية.",
    status: "pending",
    requestedBy: "reception-1",
    createdAt: "2026-06-01T09:15:00",
  },
  {
    id: "cr-2",
    patientFileNo: "B-3025",
    consultationType: "surgery",
    notes: "تقييم قبل الاستئصال الجراحي لساركوما يوينغ.",
    status: "pending",
    requestedBy: "reception-1",
    createdAt: "2026-06-01T11:40:00",
  },
  {
    id: "cr-3",
    patientFileNo: "B-1101",
    consultationType: "surgery",
    notes: "استشارة جراحية ما قبل استئصال ورم ويلمز.",
    status: "coordinated",
    requestedBy: "reception-1",
    createdAt: "2026-05-28T10:00:00",
  },
  {
    id: "cr-4",
    patientFileNo: "B-2069",
    consultationType: "ophthalmic",
    notes: "استبعاد ارتشاح شبكي مرافق لابيضاض الدم النقوي الحاد.",
    status: "pending",
    requestedBy: "reception-1",
    createdAt: "2026-06-02T07:55:00",
  },
  {
    id: "cr-5",
    patientFileNo: "B-1090",
    consultationType: "ent",
    notes: "تضخم عقد لمفية رقبية يتطلب تقييم أذنية.",
    status: "coordinated",
    requestedBy: "reception-1",
    createdAt: "2026-05-20T08:30:00",
  },
];
