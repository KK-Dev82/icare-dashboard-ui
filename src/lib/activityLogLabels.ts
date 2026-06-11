export const ACTIVITY_ENTITY_TYPE_LABEL: Record<string, string> = {
  PRODUCT: "ผลิตภัณฑ์",
  PRODUCT_CATEGORY: "หมวดหมู่ผลิตภัณฑ์",
  POLICY: "กรมธรรม์",
  MEMBER: "สมาชิก",
  CONTENT: "ข่าวสาร / โปรโมชัน",
  CONTENT_CATEGORY: "หมวดหมู่ข่าวสาร",
  CONTACT_CASE: "คำขอติดต่อ",
  CONTACT_CATEGORY: "ประเภทการติดต่อ",
  LEAD: "รายการผู้สนใจ",
  USER: "ผู้ใช้งาน",
  ADMIN_USER: "บัญชีผู้ดูแลระบบ",
  AUTH: "การเข้าสู่ระบบ",
  SETTING: "ตั้งค่าระบบ",
  SYSTEM: "ระบบ",
};

export const ACTIVITY_ACTION_LABEL: Record<string, string> = {
  CREATE: "เพิ่มข้อมูล",
  UPDATE: "แก้ไขข้อมูล",
  DELETE: "ลบข้อมูล",
  PUBLISH: "เผยแพร่",
  UNPUBLISH: "ยกเลิกเผยแพร่",
  STATUS_CHANGE: "เปลี่ยนสถานะ",
  LOGIN: "เข้าสู่ระบบ",
  LOGIN_FAILED: "เข้าสู่ระบบไม่สำเร็จ",
  LOGOUT: "ออกจากระบบ",
  READ: "อ่านรายการ",
  MARK_READ: "อ่านรายการ",
};

export const ACTIVITY_FIELD_LABEL: Record<string, string> = {
  username: "ชื่อผู้ใช้",
  fullName: "ชื่อผู้ใช้งาน",
  firstName: "ชื่อ",
  lastName: "นามสกุล",
  name: "ชื่อ",
  title: "หัวข้อ",
  summary: "สรุป",
  description: "รายละเอียด",
  content: "รายละเอียด",
  message: "ข้อความ",
  subject: "หัวข้อ",
  phone: "เบอร์โทรศัพท์",
  contactPhone: "เบอร์โทรศัพท์",
  contactName: "ชื่อผู้ติดต่อ",
  contactEmail: "อีเมลผู้ติดต่อ",
  email: "อีเมล",
  role: "บทบาท",
  status: "สถานะ",
  caseStatus: "สถานะคำขอ",
  readStatus: "สถานะการอ่าน",
  isActive: "สถานะการใช้งาน",
  isPublish: "สถานะเผยแพร่",
  isPinned: "ปักหมุด",
  sortOrder: "ลำดับการแสดงผล",
  mainImage: "รูปภาพหลัก",
  bannerImage: "รูปภาพแบนเนอร์",
  image: "รูปภาพ",
  icon: "ไอคอน",
  album: "อัลบั้ม",
  coverages: "ความคุ้มครอง",
  tagColor: "สีแท็ก",
  note: "หมายเหตุ",
  value: "ค่า",
  key: "คีย์",
  createdBy: "สร้างโดย",
  modifiedBy: "แก้ไขโดย",
  createdAt: "วันที่สร้าง",
  updatedAt: "วันที่แก้ไข",
  publishedAt: "วันที่เผยแพร่",
  expiredAt: "วันที่หมดอายุ",
  submittedAt: "วันที่ส่งคำขอ",
  readAt: "วันที่อ่าน",
  contactedAt: "วันที่ติดต่อ",
  closedAt: "วันที่ปิดรายการ",
  usernameOrId: "ผู้ใช้งาน",
};

export const ACTIVITY_VALUE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  CONTENT_EDITOR: "Content Editor",
  ACTIVE: "ใช้งาน",
  INACTIVE: "ไม่ใช้งาน",
  SUSPENDED: "ระงับการใช้งาน",
  DRAFT: "ฉบับร่าง",
  PUBLISHED: "เผยแพร่",
  UNPUBLISHED: "ไม่เผยแพร่",
  PENDING: "รอดำเนินการ",
  CONTACTED: "ติดต่อแล้ว",
  CLOSED: "ปิดรายการ",
  NEW: "รายการใหม่",
  IN_PROGRESS: "กำลังดำเนินการ",
  READ: "อ่านแล้ว",
  UNREAD: "ยังไม่อ่าน",
  MEMBER: "สมาชิก",
  CUSTOMER: "ลูกค้า",
  ALL: "ทั้งหมด",
};

export const ACTIVITY_ENTITY_TYPE_OPTIONS = Object.entries(ACTIVITY_ENTITY_TYPE_LABEL).map(
  ([value, label]) => ({ label, value }),
);

export const ACTIVITY_ACTION_OPTIONS = Object.entries(ACTIVITY_ACTION_LABEL).map(
  ([value, label]) => ({ label, value }),
);

export function formatActivityEntityTypeLabel(entityType?: string | null) {
  if (!entityType) return "-";
  return ACTIVITY_ENTITY_TYPE_LABEL[entityType] ?? formatUnknownEnum(entityType);
}

export function formatActivityActionLabel(action?: string | null) {
  if (!action) return "-";
  return ACTIVITY_ACTION_LABEL[action] ?? formatUnknownEnum(action);
}

export function formatActivityFieldLabel(field?: string | null) {
  if (!field) return "-";
  return ACTIVITY_FIELD_LABEL[field] ?? formatUnknownField(field);
}

export function formatActivityValueLabel(value?: string | null) {
  if (!value) return "-";
  return ACTIVITY_VALUE_LABEL[value] ?? value;
}

function formatUnknownEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatUnknownField(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim()
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
}
