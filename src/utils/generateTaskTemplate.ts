import * as XLSX from 'xlsx';

export interface TaskTemplateRow {
  External_Key: string;
  Name: string;
  Description?: string;
  Status?: string;
  Priority?: string;
  Start_Date?: string; // YYYY-MM-DD
  End_Date?: string;   // YYYY-MM-DD
  Baseline_Start_Date?: string; // YYYY-MM-DD
  Baseline_End_Date?: string;   // YYYY-MM-DD
  Duration?: number;
  Milestone_Name?: string;
  Parent_External_Key?: string;
  Dependencies?: string; // Comma-separated: KEY:type:lag
  Sort_Order?: number;
  Progress?: number; // 0-100
}

const TASK_HEADERS: Array<keyof TaskTemplateRow> = [
  'External_Key',
  'Name',
  'Description',
  'Status',
  'Priority',
  'Start_Date',
  'End_Date',
  'Baseline_Start_Date',
  'Baseline_End_Date',
  'Duration',
  'Milestone_Name',
  'Parent_External_Key',
  'Dependencies',
  'Sort_Order',
  'Progress',
];

export function generateTaskImportTemplate(filename = 'Project_Task_Import_Template.xlsx') {
  const wb = XLSX.utils.book_new();

  // Instructions sheet
  const instructions: string[][] = [
    ['Project Task Management Template - Instructions'],
    [''],
    ['Required fields: External_Key, Name'],
    ['Recommended fields: Status, Priority, Start_Date, End_Date, Duration'],
    ['Dates: Use YYYY-MM-DD (e.g., 2025-08-07)'],
    ['Priority values: Low, Medium, High, Critical'],
    ['Status values: Not Started, In Progress, Completed, On Hold, Cancelled'],
    ['Dependencies format: KEY:type:lag'],
    ['- type options: finish-to-start | start-to-start | finish-to-finish | start-to-finish'],
    ['- You can also use FS, SS, FF, SF as shorthand'],
    ['- lag is number of days (integer). Example: TASK-10:FS:2'],
    ['Multiple dependencies: separate by commas'],
    ['Parent_External_Key: set the External_Key of the parent task for hierarchy'],
    ['Milestone_Name: optional, matches an existing milestone name in the project'],
    ['Sort_Order: integer to order siblings under the same parent'],
    ['Progress: integer 0-100 (Completed implies 100)'],
    [''],
    ['Workflow:'],
    ['1) Fill the Tasks sheet below'],
    ['2) Export and Upload via Project Plan > Upload Template'],
    ['3) The system will import tasks (pass 1) and then resolve hierarchy/dependencies (pass 2)'],
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  // Tasks sheet with headers and a sample row
  const rows: TaskTemplateRow[] = [
    {
      External_Key: 'TASK-001',
      Name: 'Project Kickoff',
      Description: 'Run kickoff meeting',
      Status: 'Not Started',
      Priority: 'High',
      Start_Date: '2025-08-15',
      End_Date: '2025-08-16',
      Baseline_Start_Date: '2025-08-15',
      Baseline_End_Date: '2025-08-16',
      Duration: 2,
      Milestone_Name: 'Initiation',
      Parent_External_Key: '',
      Dependencies: '',
      Sort_Order: 1,
      Progress: 0,
    },
    {
      External_Key: 'TASK-002',
      Name: 'Requirement Gathering',
      Description: 'Collect requirements',
      Status: 'In Progress',
      Priority: 'Medium',
      Start_Date: '2025-08-17',
      End_Date: '2025-08-22',
      Baseline_Start_Date: '2025-08-17',
      Baseline_End_Date: '2025-08-22',
      Duration: 6,
      Milestone_Name: 'Initiation',
      Parent_External_Key: '',
      Dependencies: 'TASK-001:FS:1',
      Sort_Order: 2,
      Progress: 10,
    },
  ];

  const data = [TASK_HEADERS, ...rows.map(r => TASK_HEADERS.map(h => (r as any)[h] ?? ''))];
  const wsTasks = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks');

  XLSX.writeFile(wb, filename);
}
