import React, { useEffect } from 'react';
import { getDB } from '../storage/scheduleStorage';

export default function DebugDB() {
  useEffect(() => {
    async function fetchData() {
      const data = await getDB();
      console.log('전체 DB 내용:', JSON.stringify(data, null, 2));
    }
    fetchData();
  }, []);

  return null;  // 화면엔 아무것도 안보임
}
