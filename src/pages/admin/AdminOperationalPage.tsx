import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useLocation, useOutletContext, useParams } from 'react-router-dom';
import { AlertTriangle, Archive, Check, ChevronLeft, ChevronRight, Loader2, Plus, RefreshCw, RotateCcw, Search, Trash2 } from 'lucide-react';
import { adminOperationsService, type OperationalModule } from '../../services/adminOperationsService';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';
import type { User } from '../../types';

type FormField = { name: string; label: string; type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'textarea' | 'select' | 'image'; options?: string[]; required?: boolean };
type Row = Record<string, unknown> & { id: string; archivedAt?: string | null; status?: string };

const configs: Record<OperationalModule, { title: string; description: string; collectionKey: string; itemKey: string; fields: FormField[]; columns: Array<{ name: string; label: string }>; readOnly?: boolean }> = {
  students: {
    title: 'Students',
    description: 'Manage student accounts and profile records.',
    collectionKey: 'students',
    itemKey: 'student',
    fields: [
      { name: 'fullName', label: 'Full name', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'photo', label: 'Profile photo', type: 'image' },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'country', label: 'Country' },
      { name: 'city', label: 'City' },
      { name: 'education', label: 'Education' },
      { name: 'experience', label: 'Experience' },
      { name: 'interestedCourse', label: 'Interested course' },
      { name: 'learningMode', label: 'Learning mode' },
      { name: 'careerGoal', label: 'Career goal' },
      { name: 'password', label: 'Initial password (at least 12 characters)', type: 'password', required: true },
    ],
    columns: [{ name: 'photo', label: 'Photo' }, { name: 'fullName', label: 'Student' }, { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' }, { name: 'isActive', label: 'Account' }],
  },
  attendance: {
    title: 'Attendance',
    description: 'Record and review daily attendance by student and batch.',
    collectionKey: 'attendance',
    itemKey: 'attendance',
    fields: [
      { name: 'studentId', label: 'Student ID', required: true },
      { name: 'batchId', label: 'Batch ID', required: true },
      { name: 'attendanceDate', label: 'Date', type: 'date', required: true },
      { name: 'status', label: 'Attendance status', type: 'select', options: ['present', 'absent', 'late', 'excused'], required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [{ name: 'studentName', label: 'Student' }, { name: 'batchName', label: 'Batch' }, { name: 'attendanceDate', label: 'Date' }, { name: 'status', label: 'Status' }],
  },
  batches: {
    title: 'Batches',
    description: 'Create and manage schedules, trainers, enrolments, and batch status.',
    collectionKey: 'batches',
    itemKey: 'batch',
    fields: [
      { name: 'name', label: 'Batch name', required: true },
      { name: 'code', label: 'Batch code', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'scheduleDays', label: 'Schedule days (comma-separated)' },
      { name: 'scheduleTime', label: 'Schedule time' },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['planned', 'active', 'completed', 'cancelled', 'archived'] },
    ],
    columns: [{ name: 'name', label: 'Batch' }, { name: 'code', label: 'Code' }, { name: 'startDate', label: 'Starts' }, { name: 'status', label: 'Status' }],
  },
  internships: {
    title: 'Internships',
    description: 'Manage internship opportunities, applications, supervisors, and progress.',
    collectionKey: 'internships',
    itemKey: 'internship',
    fields: [
      { name: 'title', label: 'Internship title', required: true },
      { name: 'company', label: 'Company' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'open', 'closed', 'archived'] },
    ],
    columns: [{ name: 'title', label: 'Internship' }, { name: 'company', label: 'Company' }, { name: 'startDate', label: 'Starts' }, { name: 'status', label: 'Status' }],
  },
  activity: {
    title: 'Activity History',
    description: 'Read-only audit trail of administrator and user actions.',
    collectionKey: 'auditLogs',
    itemKey: 'entry',
    fields: [],
    columns: [{ name: 'action', label: 'Action' }, { name: 'resource_type', label: 'Resource' }, { name: 'actor_user_id', label: 'Actor ID' }, { name: 'created_at', label: 'Time' }],
    readOnly: true,
  },
  certificates: {
    title: 'Certificates',
    description: 'Issue, verify, and revoke student certificates.',
    collectionKey: 'certificates',
    itemKey: 'certificate',
    fields: [
      { name: 'studentId', label: 'Student ID', required: true },
      { name: 'courseName', label: 'Course or program', required: true },
    ],
    columns: [{ name: 'certificateId', label: 'Certificate ID' }, { name: 'studentName', label: 'Student' }, { name: 'courseName', label: 'Course' }, { name: 'issuedAt', label: 'Issued' }, { name: 'status', label: 'Status' }],
  },
};

function asDisplay(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Active' : 'Inactive';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function StudentPhotoField({ value }: { value: string }) {
  const [photo, setPhoto] = useState(value);
  const [error, setError] = useState('');

  useEffect(() => {
    setPhoto(value);
  }, [value]);

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Choose a PNG, JPEG, or WebP image.');
      return;
    }
    if (file.size > 12 * 1024) {
      setError('Images must be 12 KB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('Unable to read the selected image.');
        return;
      }
      setPhoto(reader.result);
      setError('');
    };
    reader.onerror = () => setError('Unable to read the selected image.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 sm:col-span-2 lg:col-span-3">
      <input type="hidden" name="photo" value={photo} />
      <div>
        <span className="form-label">Profile photo (optional)</span>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} className="form-input w-full" />
      </div>
      <p className="text-xs text-surface-500">PNG, JPEG, or WebP; maximum 12 KB.</p>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {photo.startsWith('data:image/') && (
        <div className="flex items-center gap-3">
          <img src={photo} alt="Profile photo preview" className="h-12 w-12 rounded-full border border-surface-200 object-cover" />
          <button type="button" onClick={() => { setPhoto(''); setError(''); }}
            className="rounded-lg px-2 py-1 text-xs text-red-700 hover:bg-red-50">Remove photo</button>
        </div>
      )}
    </div>
  );
}

function asPayload(fields: FormField[], form: FormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const scheduleDays: string[] = [];
  let scheduleTime = '';
  for (const field of fields) {
    const value = String(form.get(field.name) ?? '').trim();
    if (field.name === 'scheduleDays') {
      scheduleDays.push(...value.split(',').map(item => item.trim()).filter(Boolean));
      continue;
    }
    if (field.name === 'scheduleTime') {
      scheduleTime = value;
      continue;
    }
    if (field.type === 'number') payload[field.name] = Number(value);
    else payload[field.name] = value;
  }
  if (fields.some(field => field.name === 'scheduleDays' || field.name === 'scheduleTime')) {
    payload.schedule = { days: scheduleDays, time: scheduleTime };
  }
  return payload;
}

function exportCsv(module: string, records: Row[], columns: Array<{ name: string; label: string }>): void {
  const quote = (value: unknown): string => {
    let text = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = [
    columns.map(column => quote(column.label)).join(','),
    ...records.map(record => columns.map(column => quote(record[column.name])).join(',')),
  ].join('\r\n');
  const objectUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${module}-page-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function AdminOperationalPage() {
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const user = useOutletContext<User>();
  const module = location.pathname.split('/')[2] as OperationalModule;
  const config = configs[module];
  const hasPermission = (permission: string) => user.role === 'SUPER_ADMIN' || user.permissions?.includes(permission) === true;
  const createPermission: Partial<Record<OperationalModule, string>> = {
    students: 'students.create',
    attendance: 'attendance.manage',
    batches: 'batches.create',
    internships: 'internships.create',
    certificates: 'certificates.create',
  };
  const updatePermission: Partial<Record<OperationalModule, string>> = {
    students: 'students.update',
    attendance: 'attendance.manage',
    batches: 'batches.update',
    internships: 'internships.update',
  };
  const canManageEnrollments = module === 'students' && hasPermission('enrollments.manage');
  const canCreate = Boolean(createPermission[module] && hasPermission(createPermission[module]));
  const canUpdate = Boolean(updatePermission[module] && hasPermission(updatePermission[module]));
  const [records, setRecords] = useState<Row[]>([]);
  const [studentOptions, setStudentOptions] = useState<Row[]>([]);
  const [batchOptions, setBatchOptions] = useState<Row[]>([]);
  const [trainerOptions, setTrainerOptions] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAttendanceReport, setShowAttendanceReport] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [enrollmentFor, setEnrollmentFor] = useState<Row | null>(null);
  const [enrollments, setEnrollments] = useState<Row[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [courseSlug, setCourseSlug] = useState('');
  const [applicationFor, setApplicationFor] = useState<Row | null>(null);
  const [assignmentFor, setAssignmentFor] = useState<Row | null>(null);
  const [assignmentKind, setAssignmentKind] = useState<'students' | 'trainers'>('students');
  const [showApplicationsFor, setShowApplicationsFor] = useState<Row | null>(null);
  const [applications, setApplications] = useState<Row[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const pageSize = 25;
  const sortedRecords = useMemo(() => {
    if (!sortBy) return records;
    return [...records].sort((first, second) => {
      const firstValue = first[sortBy];
      const secondValue = second[sortBy];
      const comparison = typeof firstValue === 'number' && typeof secondValue === 'number'
        ? firstValue - secondValue
        : String(firstValue ?? '').localeCompare(String(secondValue ?? ''), undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [records, sortBy, sortDirection]);

  const loadEnrollments = async (student: Row) => {
    setEnrollmentFor(student);
    setEnrollmentLoading(true);
    setError('');
    try {
      const result = await adminOperationsService.listStudentEnrollments<Row>(student.id);
      setEnrollments(result.enrollments);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load enrollments.');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const assignCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!enrollmentFor) return;
    setSaving(true);
    setError('');
    try {
      await adminOperationsService.enrollStudent(enrollmentFor.id, courseSlug.trim());
      setCourseSlug('');
      await loadEnrollments(enrollmentFor);
      setNotice('Course enrollment saved.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to enroll this student.');
    } finally {
      setSaving(false);
    }
  };

  const updateEnrollmentStatus = async (enrollment: Row, status: string) => {
    setSaving(true);
    setError('');
    try {
      await adminOperationsService.updateEnrollment(enrollment.id, status);
      if (enrollmentFor) await loadEnrollments(enrollmentFor);
      setNotice('Enrollment status updated.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update enrollment.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStudentAccount = async (student: Row) => {
    const isActive = student.isActive === true || student.isActive === 1;
    const nextStatus = !isActive;
    if (!nextStatus && !window.confirm(`Deactivate ${asDisplay(student.fullName)}? They will no longer be able to sign in.`)) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await adminOperationsService.updateAccount(student.id, { isActive: nextStatus });
      setNotice(`Student account ${nextStatus ? 'activated' : 'deactivated'}.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update this student account.');
    } finally {
      setSaving(false);
    }
  };

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search.trim()) {
      if (module === 'activity') params.set('action', search.trim());
      else if (module !== 'attendance') params.set('search', search.trim());
    }
    if (includeArchived) params.set('archived', 'true');
    if (attendanceDate) params.set('date', attendanceDate);
    if (statusFilter) params.set('status', statusFilter);
    return params;
  }, [page, search, includeArchived, attendanceDate, statusFilter, module]);

  const load = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    setError('');
    try {
      const result = await adminOperationsService.list<Row>(module, query);
      setRecords(result.records ?? []);
      setTotal(result.total ?? 0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load records.');
    } finally {
      setLoading(false);
    }
  }, [config, module, query]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, includeArchived, attendanceDate, statusFilter]);
  useEffect(() => {
    let active = true;
    const needsStudents = ['attendance', 'batches', 'internships', 'certificates'].includes(module);
    const needsBatches = module === 'attendance';
    const needsTrainers = module === 'batches' && user.role !== 'TRAINER';
    const pageParams = new URLSearchParams({ page: '1', pageSize: '100' });
    const tasks: Array<Promise<void>> = [];
    if (needsStudents) {
      tasks.push(adminOperationsService.list<Row>('students', pageParams).then(result => {
        if (active) setStudentOptions(result.records);
      }));
    }
    if (needsBatches) {
      tasks.push(adminOperationsService.list<Row>('batches', pageParams).then(result => {
        if (active) setBatchOptions(result.records);
      }));
    }
    if (needsTrainers) {
      tasks.push(adminOperationsService.listUsers<Row>('TRAINER').then(result => {
        if (active) setTrainerOptions(result.users.map(trainer => ({
          ...trainer,
          fullName: `${String(trainer.first_name ?? '')} ${String(trainer.last_name ?? '')}`.trim(),
        })));
      }));
    }
    Promise.all(tasks).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : 'Unable to load operational record options.');
    });
    return () => { active = false; };
  }, [module, user.role]);

  if (!config) return <p role="alert" className="text-red-700">Unknown operational module.</p>;
  const detailRecord = params.id ? records.find(record => record.id === params.id) : undefined;

  const save = async (form: HTMLFormElement) => {
    const payload = asPayload(config.fields, new FormData(form));
    if (module === 'students' && editing) delete payload.password;
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await adminOperationsService.update(module, editing.id, payload);
        setNotice(`${config.title.slice(0, -1) || config.title} updated.`);
      } else {
        await adminOperationsService.create(module, payload);
        setNotice(`${config.title.slice(0, -1) || config.title} created.`);
      }
      setEditing(null);
      setCreating(false);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this record.');
    } finally {
      setSaving(false);
    }
  };

  const perform = async (record: Row, action: string) => {
    setError('');
    setNotice('');
    try {
      if (action === 'delete') await adminOperationsService.remove(module, record.id);
      else await adminOperationsService.action(module, record.id, action);
      setNotice(action === 'delete' ? 'Record permanently deleted.' : `Record ${action === 'revoke' ? 'revoked' : action === 'restore' ? 'restored' : 'archived'}.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update this record.');
    }
  };

  const saveApplication = async (form: HTMLFormElement) => {
    if (!applicationFor) return;
    const formData = new FormData(form);
    const payload = { studentId: String(formData.get('studentId') ?? '').trim() };
    setSaving(true);
    setError('');
    try {
      await adminOperationsService.createInternshipApplication(applicationFor.id, payload);
      setApplicationFor(null);
      setNotice('Internship application added.');
      await loadApplications(applicationFor);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to add the internship application.');
    } finally {
      setSaving(false);
    }
  };

  const loadApplications = async (internship: Row) => {
    setApplicationsLoading(true);
    setError('');
    try {
      const result = await adminOperationsService.listInternshipApplications<Row>(
        new URLSearchParams({ internshipId: internship.id, page: '1', pageSize: '100' }),
      );
      setApplications(result.applications);
      setShowApplicationsFor(internship);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load internship applications.');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const saveApplicationDetails = async (application: Row, form: HTMLFormElement) => {
    const data = new FormData(form);
    const payload = {
      status: String(data.get('status') ?? 'applied'),
      progress: Number(data.get('progress') ?? 0),
      supervisorId: String(data.get('supervisorId') ?? '').trim() || null,
      notes: String(data.get('notes') ?? ''),
    };
    setSaving(true);
    setError('');
    try {
      await adminOperationsService.updateInternshipApplication(application.id, payload);
      setNotice('Application updated.');
      if (showApplicationsFor) await loadApplications(showApplicationsFor);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update the application.');
    } finally {
      setSaving(false);
    }
  };

  const saveAssignment = async (form: HTMLFormElement) => {
    if (!assignmentFor) return;
    const fieldName = assignmentKind === 'students' ? 'studentIds' : 'trainerIds';
    const ids = new FormData(form).getAll(fieldName).map(value => String(value).trim()).filter(Boolean);
    setSaving(true);
    setError('');
    try {
      await adminOperationsService.assignBatch(assignmentFor.id, assignmentKind, ids);
      setNotice(`${assignmentKind === 'students' ? 'Students' : 'Trainers'} assigned.`);
      setAssignmentFor(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to assign this batch.');
    } finally {
      setSaving(false);
    }
  };

  const loadAttendanceReport = async () => {
    setError('');
    try {
      const result = await adminOperationsService.getAttendanceReport(new URLSearchParams());
      setAttendanceReport(result.report);
      setShowAttendanceReport(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load the attendance report.');
    }
  };

  const formFields = config.fields.filter(field =>
    !(module === 'certificates' && editing)
    && !(module === 'attendance' && editing && ['studentId', 'batchId'].includes(field.name)),
  );
  const selectedRecord = editing ?? (params.id ? detailRecord ?? null : null);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold mb-2">
            <ShinyText text="Academy Operational Data" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="font-display text-2xl font-bold text-surface-900">{config.title}</h1>
          <p className="mt-1 text-sm text-surface-500">{config.description}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => exportCsv(module, records, config.columns)} className="btn-secondary btn" disabled={loading || records.length === 0}>
            Export page CSV
          </button>
          <button type="button" onClick={() => void load()} className="btn-secondary btn inline-flex items-center gap-2" disabled={loading}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          {canCreate && !config.readOnly && (
            <button type="button" onClick={() => { setEditing(null); setCreating(true); setNotice(''); }} className="btn-primary btn inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add {config.title.replace(/s$/, '')}
            </button>
          )}
        </div>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}

      {(
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-surface-100 bg-white p-4">
          {module !== 'attendance' && (
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder={module === 'activity' ? 'Filter by action...' : `Search ${config.title.toLowerCase()}...`} className="form-input w-full pl-9" aria-label={`Search ${config.title}`} />
          </div>
          )}
          {module === 'students' && (
            <label className="flex items-center gap-2 text-sm text-surface-600">
              <input type="checkbox" checked={includeArchived} onChange={event => setIncludeArchived(event.target.checked)} />
              Show archived only
            </label>
          )}
          {module === 'attendance' && (
            <>
              <label className="min-w-44"><span className="form-label">Attendance date</span><input type="date" value={attendanceDate} onChange={event => setAttendanceDate(event.target.value)} className="form-input w-full" /></label>
              <button type="button" onClick={() => void loadAttendanceReport()} className="btn-secondary btn">Attendance report</button>
            </>
          )}
          {['batches', 'internships', 'certificates'].includes(module) && (
            <label className="min-w-40"><span className="form-label">Status</span><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="form-select w-full">
              <option value="">All statuses</option>
              {(module === 'batches' ? ['planned', 'active', 'completed', 'cancelled', 'archived']
                : module === 'internships' ? ['draft', 'open', 'closed', 'archived']
                  : ['active', 'revoked']).map(status => <option key={status} value={status}>{status}</option>)}
            </select></label>
          )}
          <span className="text-sm text-surface-500">{total} records</span>
        </section>
      )}

      {(creating || selectedRecord) && (creating ? canCreate : canUpdate) && !config.readOnly && (
        <form
          className="rounded-2xl border border-surface-200 bg-white p-5"
          onSubmit={event => { event.preventDefault(); void save(event.currentTarget); }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-surface-900">{selectedRecord ? `Edit ${config.title.replace(/s$/, '')}` : `Add ${config.title.replace(/s$/, '')}`}</h2>
            <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-sm text-surface-500 hover:text-surface-900">Cancel</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {formFields.map(field => (
              <label key={field.name} className={field.type === 'textarea' || field.type === 'image' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                <span className="form-label">{field.label}{field.required ? ' *' : ''}</span>
                {field.type === 'textarea' ? (
                  <textarea name={field.name} required={field.required} defaultValue={String(selectedRecord?.[field.name] ?? '')} className="form-input min-h-24 w-full" />
                ) : field.type === 'image' ? (
                  <StudentPhotoField key={`${selectedRecord?.id ?? 'new'}-${field.name}`} value={String(selectedRecord?.[field.name] ?? '')} />
                ) : field.type === 'select' ? (
                  <select name={field.name} required={field.required} defaultValue={String(selectedRecord?.[field.name] ?? '')} className="form-select w-full">
                    <option value="">Select...</option>
                    {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : ['studentId', 'batchId'].includes(field.name) ? (
                  <select name={field.name} required={field.required} defaultValue={String(selectedRecord?.[field.name] ?? '')} className="form-select w-full">
                    <option value="">Select...</option>
                    {(field.name === 'studentId' ? studentOptions : batchOptions).map(option => (
                      <option key={option.id} value={option.id}>
                        {asDisplay(option.fullName ?? option.name)}{option.email ? ` — ${String(option.email)}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type={field.type ?? 'text'}
                    required={field.required}
                    min={field.type === 'number' ? 0 : undefined}
                    minLength={field.name === 'password' ? 12 : undefined}
                    autoComplete={field.name === 'password' ? 'new-password' : undefined}
                    defaultValue={field.name === 'scheduleDays'
                      ? Array.isArray((selectedRecord?.schedule as Record<string, unknown> | undefined)?.days) ? ((selectedRecord?.schedule as Record<string, unknown>).days as string[]).join(', ') : ''
                      : field.name === 'scheduleTime'
                        ? String((selectedRecord?.schedule as Record<string, unknown> | undefined)?.time ?? '')
                        : String(selectedRecord?.[field.name] ?? '')}
                    className="form-input w-full"
                  />
                )}
              </label>
            ))}
          </div>
          <button type="submit" disabled={saving} className="btn-primary btn mt-5 inline-flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
          </button>
        </form>
      )}

      {applicationFor && module === 'internships' && hasPermission('applications.manage') && (
        <form
          className="rounded-2xl border border-brand-200 bg-brand-50 p-5"
          onSubmit={event => { event.preventDefault(); void saveApplication(event.currentTarget); }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-surface-900">Add applicant to {asDisplay(applicationFor.title)}</h2>
            <button type="button" onClick={() => setApplicationFor(null)} className="text-sm text-surface-500 hover:text-surface-900">Cancel</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="form-label">Student *</span><select name="studentId" required className="form-select w-full" defaultValue=""><option value="">Select a student...</option>{studentOptions.map(option => <option key={option.id} value={option.id}>{asDisplay(option.fullName)} — {asDisplay(option.email)}</option>)}</select></label>
          </div>
          <button type="submit" disabled={saving} className="btn-primary btn mt-5 inline-flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add application
          </button>
        </form>
      )}

      {enrollmentFor && module === 'students' && canManageEnrollments && (
        <section className="rounded-2xl border border-brand-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="font-semibold text-surface-900">Course enrollments</h2><p className="text-sm text-surface-500">{asDisplay(enrollmentFor.fullName)} · {asDisplay(enrollmentFor.email)}</p></div>
            <button type="button" onClick={() => setEnrollmentFor(null)} className="text-sm text-surface-500 hover:text-surface-900">Close</button>
          </div>
          <form className="mb-5 flex flex-wrap items-end gap-3" onSubmit={event => { void assignCourse(event); }}>
            <label className="min-w-64 flex-1"><span className="form-label">Published course slug</span><input required maxLength={120} pattern="[a-z0-9]+([_-][a-z0-9]+)*" value={courseSlug} onChange={event => setCourseSlug(event.target.value)} className="form-input w-full" placeholder="course-slug" /></label>
            <button type="submit" disabled={saving} className="btn-primary btn">{saving ? 'Saving...' : 'Enroll student'}</button>
          </form>
          {enrollmentLoading ? <p role="status" className="text-sm text-surface-500">Loading enrollments...</p> : enrollments.length ? (
            <div className="divide-y divide-surface-100">{enrollments.map(enrollment => <div key={enrollment.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div><p className="font-medium text-surface-800">{asDisplay(enrollment.title)}</p><p className="text-xs text-surface-500">{asDisplay(enrollment.slug)} · Enrolled {asDisplay(enrollment.enrolledAt)}</p></div>
              <select aria-label={`Enrollment status for ${String(enrollment.title)}`} disabled={saving} value={String(enrollment.status)} onChange={event => void updateEnrollmentStatus(enrollment, event.target.value)} className="form-select w-auto">
                {['active', 'completed', 'withdrawn'].map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>)}</div>
          ) : <p className="text-sm text-surface-500">No course enrollments yet.</p>}
        </section>
      )}

      {showAttendanceReport && module === 'attendance' && (
        <section className="rounded-2xl border border-surface-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-surface-900">Attendance report</h2>
            <button type="button" onClick={() => setShowAttendanceReport(false)} className="text-sm text-surface-500">Close</button>
          </div>
          {attendanceReport.length === 0 ? <p className="text-sm text-surface-500">No attendance data is available for this report.</p> : (
            <div className="table-scroll"><table className="w-full text-left text-sm">
              <thead><tr className="border-b border-surface-100">{['Batch', 'Student', 'Status', 'Days'].map(label => <th key={label} className="px-3 py-2">{label}</th>)}</tr></thead>
              <tbody>{attendanceReport.map((row, index) => <tr key={`${String(row.batchId)}-${String(row.studentId)}-${String(row.status)}-${index}`} className="border-b border-surface-100">
                <td className="px-3 py-2">{asDisplay(row.batchName)}</td>
                <td className="px-3 py-2">{asDisplay(`${String(row.firstName ?? '')} ${String(row.lastName ?? '')}`.trim())}</td>
                <td className="px-3 py-2">{asDisplay(row.status)}</td>
                <td className="px-3 py-2">{asDisplay(row.count)}</td>
              </tr>)}</tbody>
            </table></div>
          )}
        </section>
      )}

      {assignmentFor && module === 'batches' && hasPermission('batches.assign') && (
        <form className="rounded-2xl border border-brand-200 bg-brand-50 p-5" onSubmit={event => { event.preventDefault(); void saveAssignment(event.currentTarget); }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-surface-900">Assign {assignmentKind} — {asDisplay(assignmentFor.name)}</h2>
            <button type="button" onClick={() => setAssignmentFor(null)} className="text-sm text-surface-500">Cancel</button>
          </div>
          <label className="block max-w-2xl">
            <span className="form-label">Assigned {assignmentKind}</span>
            <select
              name={assignmentKind === 'students' ? 'studentIds' : 'trainerIds'}
              multiple
              size={Math.min(8, Math.max(3, (assignmentKind === 'students' ? studentOptions : trainerOptions).length))}
              className="form-select w-full"
              defaultValue={(assignmentFor[assignmentKind === 'students' ? 'studentIds' : 'trainerIds'] as string[] | undefined) ?? []}
            >
              {(assignmentKind === 'students' ? studentOptions : trainerOptions).map(option => (
                <option key={option.id} value={option.id}>{asDisplay(option.fullName)}{option.email ? ` — ${String(option.email)}` : ''}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-surface-500">Use Ctrl (Windows) or Command (Mac) to select multiple people.</span>
          </label>
          <button type="submit" disabled={saving} className="btn-primary btn mt-4">Save assignments</button>
        </form>
      )}

      {showApplicationsFor && module === 'internships' && hasPermission('applications.manage') && (
        <section className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
          <div className="flex items-center justify-between border-b border-surface-100 p-4">
            <h2 className="font-semibold text-surface-900">Applications — {asDisplay(showApplicationsFor.title)}</h2>
            <button type="button" onClick={() => setShowApplicationsFor(null)} className="text-sm text-surface-500">Close</button>
          </div>
          {applicationsLoading ? <p role="status" className="p-5 text-sm text-surface-500">Loading applications...</p> : applications.length === 0 ? <p className="p-5 text-sm text-surface-500">No applications yet.</p> : (
            <div className="divide-y divide-surface-100">
              {applications.map(application => (
                <form key={application.id} className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5" onSubmit={event => { event.preventDefault(); void saveApplicationDetails(application, event.currentTarget); }}>
                  <p className="self-center text-sm font-medium">{asDisplay(application.studentName)}<span className="block text-xs text-surface-500">{asDisplay(application.studentId)}</span></p>
                  <select name="status" defaultValue={String(application.status ?? 'applied')} className="form-select">
                    {['applied', 'reviewing', 'accepted', 'rejected', 'in_progress', 'completed'].map(status => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                  </select>
                  <input name="progress" type="number" min="0" max="100" defaultValue={Number(application.progress ?? 0)} className="form-input" aria-label="Progress percentage" />
                  <select name="supervisorId" defaultValue={String(application.supervisorId ?? '')} className="form-select" aria-label="Assigned supervisor">
                    <option value="">No supervisor</option>
                    {trainerOptions.map(trainer => <option key={trainer.id} value={trainer.id}>{asDisplay(trainer.fullName)} — {asDisplay(trainer.email)}</option>)}
                  </select>
                  <div className="flex gap-2"><input name="notes" defaultValue={String(application.notes ?? '')} className="form-input min-w-0 flex-1" placeholder="Notes" aria-label="Notes" /><button type="submit" disabled={saving} className="btn-primary btn">Save</button></div>
                </form>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-surface-100 bg-white">
        {loading ? (
          <p role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-surface-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading {config.title.toLowerCase()}...</p>
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-surface-300" />
            <p className="mt-3 font-medium text-surface-700">No {config.title.toLowerCase()} found</p>
            <p className="mt-1 text-sm text-surface-500">{search ? 'Try a different search.' : 'Add a record to get started.'}</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-surface-100 bg-surface-50">{config.columns.map(column => <th key={column.name} aria-sort={sortBy === column.name ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} className="px-4 py-3 font-semibold text-surface-600"><button type="button" onClick={() => { if (sortBy === column.name) setSortDirection(direction => direction === 'asc' ? 'desc' : 'asc'); else { setSortBy(column.name); setSortDirection('asc'); } }}>{column.label}{sortBy === column.name ? (sortDirection === 'asc' ? ' (asc)' : ' (desc)') : ''}</button></th>)}<th className="px-4 py-3 text-right font-semibold text-surface-600">Actions</th></tr></thead>
              <tbody className="divide-y divide-surface-100">
                {sortedRecords.map(record => (
                  <tr key={record.id} className="hover:bg-surface-50">
                      {config.columns.map(column => <td key={column.name} className="max-w-64 px-4 py-3 text-surface-700">{column.name === 'photo' && typeof record.photo === 'string' && record.photo
                        ? <img src={record.photo} alt={`${asDisplay(record.fullName)} profile`} className="h-9 w-9 rounded-full object-cover" />
                        : column.name === 'isActive' ? ((record.isActive === true || record.isActive === 1) ? 'Active' : 'Inactive') : asDisplay(record[column.name])}</td>)}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {module === 'students' && hasPermission('users.update') && <button type="button" disabled={saving || (Boolean(record.isActive) && !hasPermission('users.deactivate'))} onClick={() => void toggleStudentAccount(record)} className="rounded-lg px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-100 disabled:opacity-40">{record.isActive ? 'Deactivate' : 'Activate'}</button>}
                        {!config.readOnly && canUpdate && module !== 'certificates' && <button type="button" onClick={() => { setEditing(record); setCreating(false); }} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">Edit</button>}
                        {canManageEnrollments && <button type="button" onClick={() => void loadEnrollments(record)} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">Courses</button>}
                        {module === 'internships' && hasPermission('applications.read') && <>{hasPermission('applications.manage') && <button type="button" disabled={record.status !== 'open'} onClick={() => setApplicationFor(record)} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-40">Add applicant</button>}<button type="button" onClick={() => void loadApplications(record)} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">Applications</button></>}
                        {module === 'certificates' && <a href={`/api/certificates/verify/${encodeURIComponent(String(record.certificateId ?? ''))}`} target="_blank" rel="noreferrer" className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">Verify</a>}
                        {module === 'batches' && hasPermission('batches.assign') && <button type="button" onClick={() => { setAssignmentFor(record); setAssignmentKind('students'); }} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">Assign students</button>}
                        {module === 'batches' && hasPermission('batches.assign') && <button type="button" onClick={() => { setAssignmentFor(record); setAssignmentKind('trainers'); }} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">Assign trainers</button>}
                        {module === 'students' && hasPermission(record.archivedAt ? 'students.restore' : 'students.archive') && (
                          <button type="button" onClick={() => void perform(record, record.archivedAt ? 'restore' : 'archive')} className="rounded-lg p-2 text-surface-500 hover:bg-surface-100" aria-label={record.archivedAt ? 'Restore student' : 'Archive student'}>
                            {record.archivedAt ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                          </button>
                        )}
                        {module === 'batches' && record.status !== 'archived' && hasPermission('batches.archive') && <button type="button" onClick={() => void perform(record, 'archive')} className="rounded-lg p-2 text-surface-500 hover:bg-surface-100" aria-label="Archive batch"><Archive className="h-4 w-4" /></button>}
                        {module === 'certificates' && record.status === 'active' && hasPermission('certificates.revoke') && <button type="button" onClick={() => void perform(record, 'revoke')} className="rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Revoke</button>}
                        {((module === 'students' && hasPermission('students.delete'))
                          || (module === 'batches' && hasPermission('batches.delete'))
                          || (module === 'internships' && hasPermission('internships.delete'))
                          || (module === 'certificates' && hasPermission('certificates.delete'))) && <button type="button" onClick={() => { if (window.confirm(`Permanently delete this ${config.title.toLowerCase().slice(0, -1)}?`)) void perform(record, 'delete'); }} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${config.title.toLowerCase().slice(0, -1)}`}><Trash2 className="h-4 w-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <footer className="flex items-center justify-between border-t border-surface-100 px-4 py-3">
          <span className="text-xs text-surface-500">Page {page} · {total} total</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)} className="btn-secondary btn p-2 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" disabled={page * pageSize >= total || loading} onClick={() => setPage(value => value + 1)} className="btn-secondary btn p-2 disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </footer>
      </section>
    </div>
  );
}
