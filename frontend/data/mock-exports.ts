import { ExportHistoryItem } from '@/types';

export const mockExportHistory: ExportHistoryItem[] = [
  {
    id: 'EXP-001',
    fileName: 'puducherry_cbse_schools_leads_20260831.csv',
    taskId: 'TASK-000124',
    taskTitle: 'Puducherry + CBSE Schools',
    format: 'CSV',
    rows: 100,
    createdAt: '31 Aug 2026, 11:00 AM',
    downloadUrl: '#',
  },
  {
    id: 'EXP-002',
    fileName: 'chennai_engineering_colleges_20260830.xlsx',
    taskId: 'TASK-000123',
    taskTitle: 'Chennai + Engineering Colleges',
    format: 'EXCEL',
    rows: 150,
    createdAt: '30 Aug 2026, 03:00 PM',
    downloadUrl: '#',
  },
  {
    id: 'EXP-003',
    fileName: 'coimbatore_textile_mfrs_20260828.csv',
    taskId: 'TASK-000121',
    taskTitle: 'Coimbatore + Textile Manufacturers',
    format: 'CSV',
    rows: 184,
    createdAt: '28 Aug 2026, 10:15 AM',
    downloadUrl: '#',
  },
];
