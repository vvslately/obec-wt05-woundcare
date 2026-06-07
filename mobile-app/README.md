## mobile-app (React Native + Expo)

เป้าหมาย: เชื่อมต่อกับ backend-api (Express + MySQL2 + Socket.IO) เพื่อ “แจ้งเตือนเหตุขโมย” แบบเรียลไทม์

### 1) สร้างโปรเจกต์ Expo
```bash
cd /Users/wan/Documents/GitHub/obec-thief-detector
npx create-expo-app@latest mobile-app --template blank-typescript --yes
```

### 2) ติดตั้ง npm dependencies
```bash
cd mobile-app
npm install axios zustand @tanstack/react-query socket.io-client
```

### 3) ตั้งค่า URL backend และ userId (ตัวอย่าง)
ใน `app.json` ใส่ `extra` เช่น:
```json
{
  "expo": {
    "extra": {
      "BACKEND_URL": "http://localhost:4000",
      "USER_ID": 1
    }
  }
}
```

> หมายเหตุ: ตัวอย่างนี้ยังไม่ทำระบบ auth เต็มรูปแบบ เพื่อให้คุณต่อยอดได้ง่ายในรอบแรก

### 4) เพิ่มไฟล์ในโฟลเดอร์ `src/` ตามที่แนบใน repo นี้
- `src/types.ts`
- `src/api/http.ts`
- `src/api/alerts.ts`
- `src/store/userStore.ts`
- `src/store/alertsStore.ts`
- `src/socket.ts`

### 5) แก้ไฟล์ `App.tsx` เพื่อให้
- ต่อ Socket.IO แล้ว `register` ด้วย `userId`
- ใช้ React Query ดึง `GET /api/v1/alerts`

