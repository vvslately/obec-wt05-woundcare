# Obec Thief Detector (บ้านปลอดขโมย)

โปรเจกต์เดโมสำหรับ “ตรวจจับเหตุขโมยในบ้าน” แบ่งเป็น 2 ฝั่งหลัก:

1. `backend-api`  
   - Express + MySQL2 สำหรับเก็บประวัติ “แจ้งเหตุ”
   - Socket.IO สำหรับส่งแจ้งเตือนแบบเรียลไทม์ไปมือถือ

2. `mobile-app`  
   - React Native + Expo
   - ใช้ `axios` (เรียก API), `zustand` (เก็บ state), `@tanstack/react-query` (ดึงรายการแจ้งเหตุ), `socket.io-client` (รับแจ้งเตือนแบบเรียลไทม์)

## Backend API
อ่านรายละเอียดได้ที่: `backend-api/README.md`

## Mobile App
อ่านรายละเอียดได้ที่: `mobile-app/README.md`

