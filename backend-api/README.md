## backend-api (Express + MySQL2 + Socket.IO)

This folder will contain the API server for the "บ้านปลอดขโมย" demo:
- REST API (alerts/events)
- MySQL2 persistence
- Socket.IO for real-time alerts to the mobile app

### Requirements
- Node.js 18+ (แนะนำ 20+)
- MySQL

### Setup
1) ติดตั้ง dependencies
   - `cd backend-api`
   - `npm install`

2) ตั้งค่า environment
   - คัดลอก `.env.example` เป็น `.env`
   - `cp .env.example .env`

3) สร้าง database + ตาราง
   - สร้าง DB ตาม `DB_NAME` ก่อน (เช่น `obec_thief_detector`)
   - รันไฟล์ `schema.sql` ใน MySQL

### Run dev server
- `npm run dev`

### API
- `GET  /api/v1/health`
- `POST /api/v1/events/thief`
  - Body (JSON)
    - `deviceUid` (required)
    - `alertType` (optional, default: `THIEF_DETECTED`)
    - `severity` (optional, default: `3`)
    - `confidence` (optional, 0-1)
    - `occurredAt` (optional, ISO string)
    - `metadata` (optional, object)

- `GET /api/v1/alerts?deviceUid=...&limit=20`

#### ตัวอย่างทดสอบ (MySQL)
```sql
INSERT INTO users (name) VALUES ('Owner');
-- สมมติ user_id = 1

INSERT INTO devices (user_id, device_uid, name)
VALUES (1, 'device-001', 'Main Door Sensor');
```

#### ทดสอบเรียกเหตุขโมย
```bash
curl -X POST "http://localhost:4000/api/v1/events/thief" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceUid": "device-001",
    "severity": 5,
    "confidence": 0.92,
    "metadata": { "camera": "front-door", "note": "unexpected movement" }
  }'
```

### Socket.IO
- Mobile/client ส่ง `register`:
  - `socket.emit("register", { userId })`
- เมื่อเกิดเหตุ `POST /events/thief` แล้วระบบจะ emit ไปที่ห้อง:
  - `user:${userId}`
  - event: `thiefAlert`


