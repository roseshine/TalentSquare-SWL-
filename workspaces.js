/* Workspace data is a local preview; account settings use the Django session API. */
window.createTalentSphereWorkspaces = function ({
  Icon, Link, Panel, Field, Notice, EmptyState, SubmitCompetitionPage, navigate, readStored, formErrors, focusError, requestApi
}) {
  const { useState, useEffect } = React;
  const DATA = window.TALENTSPHERE_DATA;
  const STORE_KEY = 'talentsphere-workspaces-v1';
  const seed = {
    profile: { name: 'Sarah Khan', headline: 'Developer, problem-solver & lifelong learner', institution: 'University of Dhaka',
      bio: 'Building useful products and exploring distributed systems. Looking for my next team challenge.', skills: 'React, Python, problem solving', github: 'https://github.com/example', linkedin: 'https://linkedin.com/in/example' },
    organizer: { name: 'Campus Builders Club', website: 'https://example.com', institution: 'University of Dhaka', bio: 'A student-led community connecting ambitious builders through practical challenges.' },
    company: { name: 'Northstar Labs', website: 'https://example.com', location: 'Dhaka · Hybrid', bio: 'A product team building accessible tools for education and community collaboration.' },
    settings: { reminders: true, opportunities: true, publicProfile: false },
    notifications: [
      { id: 'n1', title: 'Your next challenge is waiting', body: 'Explore the DesignSphere challenge and check the participation requirements.', read: false },
      { id: 'n2', title: 'A fresh opportunity', body: 'Northstar Labs has a sample frontend internship in the opportunities board.', read: false },
      { id: 'n3', title: 'Welcome to your workspace', body: 'Complete your profile and make this space your own.', read: true }
    ],
    registrations: [
      { id: 'r1', competitionId: 'cyber-uiux-design-challenge-2026', team: 'Pixel Pioneers', status: 'Preparing submission', submission: '' },
      { id: 'r2', competitionId: 'cloud-native-devops-battle-2026', team: 'Individual', status: 'Registered', submission: '' }
    ],
    events: [
      { id: 'e1', title: 'Campus Innovation Sprint', category: 'Hackathon', date: '2026-11-21', status: 'Published', registrations: 48, description: 'Build a useful solution to a real campus problem in a collaborative weekend sprint.' },
      { id: 'e2', title: 'Design for Everyone', category: 'Design challenge', date: '2026-12-05', status: 'Under review', registrations: 0, description: 'Design an inclusive student service that works for people with different access needs.' }
    ],
    participants: [
      { id: 'p1', name: 'Sarah Khan', team: 'Pixel Pioneers', event: 'Campus Innovation Sprint', status: 'Confirmed', score: '' },
      { id: 'p2', name: 'Arifur Rahman', team: 'Code Collective', event: 'Campus Innovation Sprint', status: 'Confirmed', score: '' },
      { id: 'p3', name: 'Priya Sundaram', team: 'Neural Spark', event: 'Campus Innovation Sprint', status: 'Pending', score: '' }
    ],
    jobs: [
      { id: 'j1', title: 'Frontend Engineering Intern', type: 'Internship', location: 'Dhaka · Hybrid', status: 'Open', description: 'Build thoughtful, accessible React interfaces alongside a small product team.', skills: 'React, JavaScript, CSS' },
      { id: 'j2', title: 'Junior Product Designer', type: 'Full-time', location: 'Remote', status: 'Draft', description: 'Turn research into clear interfaces and help improve our design system.', skills: 'Figma, prototyping, accessibility' }
    ],
    applications: [
      { id: 'a1', name: 'Sarah Khan', jobId: 'j1', skills: 'React, TypeScript, CSS', status: 'Applied' },
      { id: 'a2', name: 'Devon Chen', jobId: 'j1', skills: 'React, Node.js, product development', status: 'Shortlisted' },
      { id: 'a3', name: 'Mateo Silva', jobId: 'j2', skills: 'Figma, design systems, accessibility', status: 'Applied' }
    ],
    shortlisted: [],
    approvals: [
      { id: 'q1', title: 'Design for Everyone', organizer: 'Campus Builders Club', kind: 'Competition', status: 'Pending', notes: '', description: 'An inclusive design challenge for university students. Proposed date: 5 December 2026.', originId: 'e2' },
      { id: 'q2', title: 'Campus Career Connections', organizer: 'Graduate Careers Network', kind: 'Job fair', status: 'Pending', notes: '', description: 'A proposed campus hiring fair with portfolio reviews and early-career opportunities.' }
    ],
    users: [
      { id: 'u1', name: 'Sarah Khan', role: 'Participant', status: 'Active' },
      { id: 'u2', name: 'Campus Builders Club', role: 'Organizer', status: 'Active' },
      { id: 'u3', name: 'Northstar Labs', role: 'Recruiter', status: 'Active' }
    ],
    sources: [
      { id: 's1', name: 'University announcements', url: 'https://example.com/university/feed', type: 'RSS', interval: 'Every 6 hours', enabled: true, status: 'Demo source' },
      { id: 's2', name: 'Partner competition platform', url: 'https://example.com/competitions', type: 'Website', interval: 'Daily', enabled: false, status: 'Demo source' },
      { id: 's3', name: 'Organizer Facebook Page', url: 'https://www.facebook.com/', type: 'Facebook', interval: 'Daily', enabled: false, status: 'Authorization required' }
    ],
    imports: [
      { id: 'i1', title: 'Student Sustainability Hackathon', organizer: 'Green Campus Collective', sourceId: 's1', category: 'Hackathon',
        date: '2026-12-12', deadline: '2026-12-05', sourceUrl: 'https://example.com/sustainability-challenge', status: 'Pending',
        description: 'Create a practical tool to reduce waste or improve energy use on campus.', issue: 'Confirm eligibility and prizes with the organizer.' },
      { id: 'i2', title: 'Campus Innovation Sprint', organizer: 'Campus Builders Club', sourceId: 's2', category: 'Hackathon',
        date: '2026-11-21', deadline: '2026-11-14', sourceUrl: 'https://example.com/campus-sprint', status: 'Pending',
        description: 'A second sample announcement for the Campus Innovation Sprint.', issue: 'Possible duplicate of an existing competition.', duplicateOf: 'e1' }
    ],
    history: [
      { id: 'h1', time: 'Sample run', source: 'University announcements', result: 'Completed', detail: 'One sample competition draft prepared for review.' },
      { id: 'h2', time: 'Sample run', source: 'Organizer Facebook Page', result: 'Blocked', detail: 'A supported connection and authorization are required. No content was fetched.' }
    ],
    results: [],
    fairs: DATA.jobFairs.map(f => ({ id: f.id, title: f.title, date: f.dates, status: 'Listed' }))
  };
  function loadStore() {
    const stored = readStored(STORE_KEY, {});
    const value = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    return Object.fromEntries(Object.entries(seed).map(([key, fallback]) => [key,
      Array.isArray(fallback) ? (Array.isArray(value[key]) ? value[key] : fallback) :
        { ...fallback, ...(value[key] && typeof value[key] === 'object' && !Array.isArray(value[key]) ? value[key] : {}) }]));
  }
  function useDemoStore() {
    const [db, setDb] = useState(loadStore), [error, setError] = useState('');
    useEffect(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); setError(''); }
      catch { setError('Changes work for this visit, but your browser could not save them.'); }
    }, [db]);
    return [db, setDb, error];
  }
  const uid = prefix => prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  const stamp = () => new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const route = (role, tab = 'overview') => '/workspace?role=' + role + '&tab=' + tab;
  const adminRoute = (tab = 'overview') => '/admin?tab=' + tab;
  const menus = {
    participant: [['overview','Overview','layoutgrid'],['competitions','My competitions','trophy'],['applications','Applications','briefcase'],['saved','Saved events','sparkles'],['profile','My profile','user'],['notifications','Notifications','clock'],['settings','Settings','shieldcheck']],
    organizer: [['overview','Overview','layoutgrid'],['competitions','My competitions','trophy'],['create','Create competition','rocket'],['participants','Participants','users'],['results','Results','trendingup'],['profile','Organization','building2'],['notifications','Notifications','clock'],['settings','Settings','shieldcheck']],
    recruiter: [['overview','Overview','layoutgrid'],['opportunities','Opportunities','briefcase'],['applicants','Applicants','users'],['talent','Find talent','search'],['profile','Company profile','building2'],['notifications','Notifications','clock'],['settings','Settings','shieldcheck']]
  };
  menus.participant.push(['fairs','My job fairs','briefcase']);
  menus.organizer.push(['fairs','My job fairs','briefcase']);
  const adminMenu = [['overview','Overview','layoutgrid'],['live-imports','Live imports','rocket'],['approvals','Approvals','checkcircle2'],['users','People & roles','users'],['sources','Import sources','layoutgrid'],['imports','Import review','eye'],['history','Import history','clock'],['rankings','Results & rankings','trendingup'],['fairs','Job fairs','briefcase']];
  const descriptions = {
    overview: 'A clear view of what matters, and an easy path to your next step.',
    'live-imports': 'Collect from supported sources, review real competition records, and follow every import run.',
    competitions: 'Keep your challenges, teams, and event details in one place.',
    applications: 'Follow your opportunities from your first application to the next conversation.',
    saved: 'A little inspiration for later. Your saved competitions and fairs live here.',
    create: 'Turn your idea into an event people will remember.',
    participants: 'Meet the people bringing your competition to life.',
    results: 'Review submissions and prepare clear, transparent results.',
    opportunities: 'Create opportunities that connect your team with promising talent.',
    applicants: 'Review applications and organize the next steps.',
    talent: 'Find people whose skills and ambitions fit your team.',
    profile: 'Tell the community who you are and what you are building.',
    notifications: 'The updates and reminders worth your attention.',
    settings: 'Make your Talent Square experience work for you.',
    approvals: 'Review community submissions before they reach the platform.',
    users: 'Explore account roles and preview account moderation.',
    sources: 'Organize the sources that will power competition discovery.',
    imports: 'Check the details, resolve duplicates, and decide what belongs.',
    history: 'Understand each collection attempt and what needs attention.',
    rankings: 'Review submitted results before they contribute to standings.',
    fairs: 'Keep the career events directory useful and up to date.'
  };
  function Badge({ children }) {
    const tone = /approved|active|published|listed|confirmed|completed|shortlisted|open|checked|submitted/i.test(String(children)) ? 'good' :
      /reject|paused|blocked|authorization|withdrawn|closed|merged/i.test(String(children)) ? 'muted' : 'waiting';
    return <span className={'work-badge ' + tone}>{children}</span>;
  }
  function Stat({ label, value, icon, detail }) {
    return <article className="work-stat"><span className="stat-icon"><Icon name={icon} className="w-5 h-5" /></span><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
  }
  function Stats({ items }) { return <div className="work-stats">{items.map(i => <Stat key={i.label} {...i} />)}</div>; }
  function Shell({ admin = false, live = false, role, tab, menu, heading, onRoleChange, authenticated = false, allowRolePreview = false, children }) {
    const base = admin ? adminRoute : t => route(role, t);
    return <div className={'work-page ' + (admin ? 'admin-page' : '')}>
      <div className="page-container"><div className="work-breadcrumb"><Link to="/">Home</Link><span>/</span><span>{admin ? 'Admin workspace' : 'My workspace'}</span></div>
        <div className="work-layout"><aside className="work-sidebar">
          <Link className="workspace-brand" to={base('overview')}><span className="workspace-symbol"><Icon name={admin ? 'shieldcheck' : 'layoutgrid'} className="w-5 h-5" /></span><div><strong>{admin ? 'Platform studio' : 'Your sphere'}</strong><small>{admin ? 'ADMIN WORKSPACE' : 'MY WORKSPACE'}</small></div></Link>
          {!admin && allowRolePreview && <label className="role-preview-label">Preview role<select aria-label="Preview role" value={role} onChange={e => onRoleChange(e.target.value)} className="form-input">
            <option value="participant">Participant</option><option value="organizer">Organizer</option><option value="recruiter">Recruiter</option>
          </select></label>}
          <nav aria-label={admin ? 'Admin sections' : 'Workspace sections'} className="workspace-nav">{menu.map(([id,label,icon]) =>
            <Link key={id} to={base(id)} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined}><Icon name={icon} className="w-4 h-4" />{label}<span aria-hidden="true">›</span></Link>)}</nav>
          <div className="workspace-sidebar-note"><Icon name="sparkles" className="w-5 h-5" /><strong>Room to grow.</strong><p>One community. Every next chapter.</p><Link to={admin ? route('participant') : '/competitions'}>{admin ? 'View member workspace' : 'Discover a challenge'} →</Link></div>
          <Link className="work-switch" to={admin ? route('organizer') : adminRoute('live-imports')}>{admin ? 'Organizer preview' : 'Admin & live imports'} →</Link>
        </aside><div className="workspace-content">
          <div className="workspace-topline"><span className="eyebrow">{admin ? 'BEHIND THE COMMUNITY' : role.toUpperCase() + ' SPACE'}</span><span className="work-preview-pill">{live ? 'Django import service' : authenticated ? 'Django account' : 'Frontend preview'}</span></div>
          <header className="workspace-heading"><h1>{heading}</h1><p>{descriptions[tab]}</p></header>
          <div className="workspace-preview-note"><Icon name="info" className="w-4 h-4" /><span>{live ? 'Connected controls · A staff account is required. Source runs and review decisions affect Django records.' : admin ? 'Sample data · Changes stay in this browser. No real users are moderated, events published, or sources contacted.' : authenticated ? 'Competition bookmarks, Participant activity and organizer registrations use Django. Applications, results and notifications remain labelled previews.' : 'Signed-out demonstration: activity and saved events stay in this browser and are not account records.'}</span></div>
          {children}
        </div></div>
      </div>
    </div>;
  }
  function Toolbar({ query, onQuery, placeholder, children }) {
    return <div className="work-toolbar"><div className="search-box"><Icon name="search" className="w-4 h-4" /><input aria-label={placeholder} placeholder={placeholder} value={query} onChange={e => onQuery(e.target.value)} /></div>{children}</div>;
  }
  function ListItem({ title, subtitle, badge, children, actions }) {
    return <article className="work-list-item"><div className="work-item-head"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{badge && <Badge>{badge}</Badge>}</div>{children}{actions && <div className="work-item-actions">{actions}</div>}</article>;
  }
  function DemoForm({ title, fields, initial, onSave, button = 'Save changes', children }) {
    const [values, setValues] = useState(initial || {}), [errors,setErrors] = useState({});
    return <Panel title={title} icon="code2"><form noValidate className="page-form" onSubmit={e => {
      e.preventDefault(); const invalid = formErrors(e.currentTarget);
      if (Object.keys(invalid).length) { setErrors(invalid); focusError(e.currentTarget, invalid); return; }
      onSave(Object.fromEntries(Object.entries(values).map(([k,v]) => [k,typeof v === 'string' ? v.trim() : v])));
    }}><div className="form-grid">{fields.map(f => <div key={f.name} className={f.type === 'textarea' ? 'wide-field' : ''}><Field {...f}
      value={values[f.name] || ''} error={errors[f.name]} onChange={e => { setValues(v => ({...v,[f.name]:e.target.value})); setErrors(x => ({...x,[f.name]:''})); }} /></div>)}</div>
      {children}<div className="form-actions"><span className="field-hint">Saved in this browser only.</span><button className="button-primary" type="submit">{button}<Icon name="checkcircle2" className="w-4 h-4" /></button></div>
    </form></Panel>;
  }
  function Notifications({ db, setDb }) {
    return <Panel title="Your updates" icon="clock"><div className="work-panel-actions"><span>{db.notifications.filter(n => !n.read).length} unread updates</span>
      <button className="button-secondary" onClick={() => setDb(d => ({...d,notifications:d.notifications.map(n=>({...n,read:true}))}))}>Mark all as read</button></div>
      {db.notifications.map(n => <ListItem key={n.id} title={n.title} subtitle={n.body} badge={n.read ? 'Read' : 'Unread'}
        actions={!n.read && <button className="work-text-button" onClick={()=>setDb(d=>({...d,notifications:d.notifications.map(x=>x.id===n.id?{...x,read:true}:x)}))}>Mark as read</button>} />)}</Panel>;
  }
  function Settings({ db, setDb, notify, requestApi, navigate, accountState, account, setAccountState }) {
    const accountStatus = accountState.status === 'loading' ? 'Checking the Django account session…' :
      accountState.status === 'error' ? 'The account service is unavailable. Start Django on port 8001 to check your session.' :
        'You are viewing a local workspace preview without a signed-in account.';
    const [loggingOut, setLoggingOut] = useState(false);
    async function signOut() {
      setLoggingOut(true);
      try {
        await requestApi('/auth/logout/', { method: 'POST', body: {} });
        setAccountState({status:'signed-out',account:null});
        navigate('/login');
      } catch (error) {
        notify(error.message || 'Could not end the account session.', true);
      } finally { setLoggingOut(false); }
    }
    return <><Panel title="Your preferences" icon="shieldcheck">{[
      ['reminders','Competition reminders','Keep deadline reminders in your notification preferences.'],
      ['opportunities','Career opportunities','Include opportunities relevant to your interests.'],
      ['publicProfile','Public participant profile','Choose whether your profile should be discoverable when accounts go live.']
    ].map(([key,label,desc]) => <label className="setting-row" key={key}><div><strong>{label}</strong><p>{desc}</p></div>
      <input type="checkbox" role="switch" checked={!!db.settings[key]} onChange={e=>{const checked=e.target.checked;setDb(d=>({...d,settings:{...d.settings,[key]:checked}}));notify('Preference saved on this device.');}} /></label>)}</Panel>
      <Panel title="Account security" icon="shieldcheck"><p>{account ? `${account.display_name} · ${account.email} · ${account.role}` : accountStatus}</p>
        {account && <p><strong>Signed in with a Django session.</strong></p>}
        <p>Login sessions use the Django backend. Password recovery uses an expiring reset link. Local messages are saved privately until an email provider is configured.</p>
        {account ? <button type="button" className="button-secondary" disabled={loggingOut} onClick={signOut}>{loggingOut ? 'Signing out…' : 'Log out'}</button> : <Link className="inline-link" to="/login">Go to login</Link>}
        <Link className="inline-link" to="/login?view=recovery">Password recovery</Link></Panel></>;
  }
  function ProfileDetails({ fields }) {
    const displayValue = value => Array.isArray(value) ? (value.length ? value.join(', ') : 'Not provided') :
      value === true ? 'Public' : value === false ? 'Private' : value == null || value === '' ? 'Not provided' : String(value);
    return <Panel title="Saved account profile" icon="user"><dl className="profile-account-details">
      {fields.map(([label, value]) => <div className="profile-account-detail" key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}
    </dl></Panel>;
  }
  const participantStatuses = [
    'University Student', 'College Student', 'School Student', 'Working Professional',
    'Unemployed / Not Currently Studying'
  ];
  const participantAvailability = [
    {value:'Jobs',label:'Available for Jobs'},
    {value:'Internships',label:'Available for Internships'},
    {value:'Freelance',label:'Available for Freelance Work'},
    {value:'Not Currently Available',label:'Not Currently Available'}
  ];
  const organizerTypes = [
    'University', 'College', 'School', 'Company / Corporate Organization',
    'Community Organization', 'Individual Organizer'
  ];
  const profileMediaUrl = value => value ? 'http://' + (window.location.hostname==='localhost'?'localhost':'127.0.0.1') + ':8001' + value : '';
  function ProfileImageEditor({kind,label,account,onSaved}) {
    const [file,setFile]=useState(null),[preview,setPreview]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
    const current=account.profile?.[kind+'_url'];
    useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
    async function save(remove=false){setBusy(true);setError('');try{const form=new FormData();if(!remove)form.append('image',file);const updated=await requestApi('/auth/profile/images/'+kind+'/',{method:remove?'DELETE':'POST',body:remove?{}:form});onSaved(updated);setFile(null);}catch(e){setError(e.data?.image?.join?.(' ')||e.data?.detail||e.message);}finally{setBusy(false);}}
    return <div className="profile-image-editor"><h3>{label}</h3><div className="profile-image-preview">{preview||current?<img src={preview||profileMediaUrl(current)} alt={label+' preview'}/>:<span>Optional</span>}</div>
      <label className="work-label">Choose {label.toLowerCase()}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{setError('');const next=e.target.files?.[0];if(next&&next.size>5*1024*1024){setError('Choose an image smaller than 5 MB.');setFile(null);}else setFile(next||null);}}/></label>
      <p className="small-note">JPEG, PNG or WebP, up to 5 MB. Images are resized and metadata is removed. Public visibility follows your profile setting.</p>
      {error&&<Notice error>{error}</Notice>}<div className="form-actions"><button className="button-secondary" disabled={!file||busy} onClick={()=>save(false)}>{busy?'Saving…':current?'Replace image':'Upload image'}</button>{current&&<button className="work-text-button" disabled={busy} onClick={()=>save(true)}>Remove {label.toLowerCase()}</button>}</div>
    </div>;
  }
  function ProfileImages({role,account,onSaved}) {return <Panel title="Photos and logos" icon="user"><div className="profile-image-grid"><ProfileImageEditor kind="photo" label={role==='organizer'?'Organization logo':'Profile photo'} account={account} onSaved={onSaved}/>{role==='recruiter'&&<ProfileImageEditor kind="company_logo" label="Company logo" account={account} onSaved={onSaved}/>}</div></Panel>;}

  function ProfileEditForm({ role, account, requestApi, onCancel, onSaved }) {
    const profile = account.profile || {};
    const [values,setValues] = useState(() => role === 'participant' ? {
      is_public: !!profile.is_public, show_email: !!profile.show_email, show_phone: !!profile.show_phone, contact_phone: profile.contact_phone || '',
      full_name: profile.full_name || account.display_name || '',
      current_status: profile.current_status || '',
      institution_name: profile.institution_name || '',
      department: profile.department || '', graduation_year: profile.graduation_year ?? '',
      codeforces_handle: profile.codeforces_handle || '', atcoder_handle: profile.atcoder_handle || '',
      achievements: profile.achievements || '', portfolio_url: profile.portfolio_url || '',
      education_info: profile.education_info || '', work_experience: profile.work_experience || '',
      bio: profile.bio || '',
      skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
      github_url: profile.github_url || '',
      linkedin_url: profile.linkedin_url || '',
      availability_preferences: Array.isArray(profile.availability_preferences) ? profile.availability_preferences : []
    } : role === 'organizer' ? {
      is_public: !!profile.is_public, show_email: !!profile.show_email, show_phone: !!profile.show_phone, contact_phone: profile.contact_phone || '',
      contact_name: profile.contact_name || '',
      organization_name: profile.organization_name || account.display_name || '',
      organizer_type: profile.organizer_type || '',
      is_affiliated: profile.is_affiliated ? 'true' : 'false',
      institution_name: profile.institution_name || '',
      department: profile.department || '',
      club_organization_name: profile.club_organization_name || '',
      description: profile.description || '',
      website_url: profile.website_url || ''
    } : {
      is_public: !!profile.is_public, show_email: !!profile.show_email, show_phone: !!profile.show_phone, contact_phone: profile.contact_phone || '',
      linkedin_url: profile.linkedin_url || '', hiring_interests: (profile.hiring_interests || []).join(', '),
      recruiter_name: profile.recruiter_name || account.display_name || '',
      company_name: profile.company_name || '',
      company_website: profile.company_website || '',
      company_description: profile.company_description || '',
      recruiter_designation: profile.recruiter_designation || ''
    });
    const [errors,setErrors] = useState({}),[formError,setFormError] = useState(''),[saving,setSaving] = useState(false);
    const change = (name,value) => {
      setValues(current => ({...current,[name]:value,...(name === 'current_status' && value === 'Unemployed / Not Currently Studying' ? {institution_name:''} : {})}));
      setErrors(current => ({...current,[name]:undefined,...(name === 'current_status' ? {institution_name:undefined} : {})}));
      setFormError('');
    };
    const errorText = value => Array.isArray(value) ? value.join(' ') : value == null ? '' : String(value);
    const fieldError = name => errorText(errors[name]);
    const renderField = (field) => <div key={field.name} className={field.type === 'textarea' ? 'wide-field' : ''}>
      <Field {...field} value={values[field.name] ?? ''} error={fieldError(field.name)} disabled={saving}
        onChange={event => change(field.name,event.target.value)} />
    </div>;
    const status = values.current_status;
    const institutionLabel = status === 'University Student' ? 'University name' :
      status === 'College Student' ? 'College name' : status === 'School Student' ? 'School name' : 'Workplace name';
    const affiliated = values.is_affiliated === 'true';
    const toggleAvailability = (choice,checked) => {
      const current = values.availability_preferences || [];
      let next;
      if (choice === 'Not Currently Available') next = checked ? [choice] : [];
      else {
        next = current.filter(item => item !== 'Not Currently Available');
        next = checked ? [...next.filter(item => item !== choice),choice] : next.filter(item => item !== choice);
      }
      change('availability_preferences',next);
    };
    const payload = () => role === 'participant' ? {
      full_name: values.full_name,
      current_status: values.current_status,
      institution_name: values.institution_name,
      department: values.department, graduation_year: values.graduation_year === '' ? null : Number(values.graduation_year),
      codeforces_handle: values.codeforces_handle, atcoder_handle: values.atcoder_handle, achievements: values.achievements,
      portfolio_url: values.portfolio_url, education_info: values.education_info, work_experience: values.work_experience,
      bio: values.bio,
      skills: String(values.skills || '').split(',').map(skill => skill.trim()).filter(Boolean),
      github_url: values.github_url,
      linkedin_url: values.linkedin_url,
      availability_preferences: values.availability_preferences
    } : role === 'organizer' ? {
      contact_name: values.contact_name,
      organization_name: values.organization_name,
      organizer_type: values.organizer_type,
      is_affiliated: affiliated,
      ...(affiliated ? {institution_name:values.institution_name} : {}),
      department: values.department,
      club_organization_name: values.club_organization_name,
      description: values.description,
      website_url: values.website_url
    } : {
      linkedin_url: values.linkedin_url, hiring_interests: values.hiring_interests.split(',').map(x=>x.trim()).filter(Boolean),
      recruiter_name: values.recruiter_name,
      company_name: values.company_name,
      company_website: values.company_website,
      company_description: values.company_description,
      recruiter_designation: values.recruiter_designation
    };
    async function submit(event) {
      event.preventDefault();
      if (saving) return;
      setErrors({});
      setFormError('');
      const invalid = formErrors(event.currentTarget);
      if (Object.keys(invalid).length) {
        setErrors(invalid);
        focusError(event.currentTarget,invalid);
        return;
      }
      setSaving(true);
      try {
        const updated = await requestApi('/auth/profile/',{method:'PATCH',body:{...payload(),is_public:values.is_public,show_email:values.show_email,show_phone:values.show_phone,contact_phone:values.contact_phone}});
        if (!updated?.authenticated || updated.id !== account.id || updated.role !== role || !updated.profile) {
          throw new Error('The account service did not confirm the saved profile.');
        }
        onSaved(updated);
      } catch (error) {
        const data = error.data || {};
        const fieldErrors = {...data};
        delete fieldErrors.detail;
        delete fieldErrors.non_field_errors;
        setErrors(fieldErrors);
        const summary = errorText(data.non_field_errors || data.detail);
        setFormError(summary || (Object.keys(fieldErrors).length ? 'Review the highlighted fields and try again.' : error.message || 'The profile could not be saved.'));
      } finally {
        setSaving(false);
      }
    }
    let fields;
    if (role === 'participant') {
      fields = [
        {name:'full_name',label:'Full name',required:true,maxLength:150},
        {name:'current_status',label:'Current status',options:participantStatuses,required:true},
        ...(status && status !== 'Unemployed / Not Currently Studying' ? [
          {name:'institution_name',label:institutionLabel,required:true,maxLength:200}
        ] : []),
        {name:'department',label:'Department',required:false,maxLength:150},
        {name:'graduation_year',label:'Graduation year',type:'number',required:false,min:1900,max:2100},
        {name:'codeforces_handle',label:'Codeforces handle',required:false,maxLength:24},
        {name:'atcoder_handle',label:'AtCoder handle',required:false,maxLength:32},
        {name:'portfolio_url',label:'Portfolio URL',type:'url',required:false,maxLength:200},
        {name:'education_info',label:'Education',type:'textarea',required:false,maxLength:5000},
        {name:'work_experience',label:'Work experience',type:'textarea',required:false,maxLength:5000},
        {name:'achievements',label:'Competition achievements (self-reported)',type:'textarea',required:false,maxLength:5000},
        {name:'bio',label:'Bio',type:'textarea',required:false,maxLength:5000},
        {name:'skills',label:'Skills',required:false,placeholder:'Separate skills with commas'},
        {name:'github_url',label:'GitHub profile URL',type:'url',required:false,maxLength:200,placeholder:'https://github.com/you'},
        {name:'linkedin_url',label:'LinkedIn profile URL',type:'url',required:false,maxLength:200,placeholder:'https://linkedin.com/in/you'}
      ];
    } else if (role === 'organizer') {
      fields = [
        {name:'contact_name',label:'Contact person',required:false,maxLength:150},
        {name:'organization_name',label:'Organization / club name',required:true,maxLength:200},
        {name:'organizer_type',label:'Organizer type',options:organizerTypes,required:true},
        {name:'is_affiliated',label:'Institution affiliation',options:[{value:'true',label:'Affiliated with an institution'},{value:'false',label:'Independent / corporate organizer'}],required:true},
        ...(affiliated ? [{name:'institution_name',label:'Institution name',required:true,maxLength:200}] : []),
        {name:'department',label:'Department',required:false,maxLength:150},
        {name:'club_organization_name',label:'Club name',required:false,maxLength:200},
        {name:'website_url',label:'Website URL',type:'url',required:false,maxLength:200,placeholder:'https://example.com'},
        {name:'description',label:'Organization description',type:'textarea',required:false,maxLength:5000}
      ];
    } else {
      fields = [
        {name:'recruiter_name',label:'Recruiter name',required:true,maxLength:150},
        {name:'company_name',label:'Company name',required:true,maxLength:200},
        {name:'hiring_interests',label:'Hiring interests',required:false,placeholder:'Frontend, Python, internships — separate with commas'},
        {name:'linkedin_url',label:'LinkedIn profile URL',type:'url',required:false,maxLength:200},
        {name:'recruiter_designation',label:'Recruiter designation',required:false,maxLength:150},
        {name:'company_website',label:'Company website',type:'url',required:false,maxLength:200,placeholder:'https://example.com'},
        {name:'company_description',label:'Company description',type:'textarea',required:false,maxLength:5000}
      ];
    }
    return <Panel title={'Edit ' + (role === 'participant' ? 'participant' : role) + ' profile'} icon="user">
      <form className="page-form" noValidate onSubmit={submit}>
        <div className="form-grid">{fields.map(renderField)}</div>
        {role === 'participant' && <fieldset className="profile-availability-group" aria-describedby={fieldError('availability_preferences') ? 'availability-error' : undefined}>
          <legend>Opportunity availability</legend>
          {participantAvailability.map(option => <label key={option.value}>
            <input type="checkbox" name="availability_preferences" checked={(values.availability_preferences || []).includes(option.value)} disabled={saving}
              onChange={event => toggleAvailability(option.value,event.target.checked)} />{option.label}
          </label>)}
          {fieldError('availability_preferences') && <p className="field-error" id="availability-error">{fieldError('availability_preferences')}</p>}
        </fieldset>}
        <fieldset className="profile-availability-group profile-privacy"><legend>Profile and contact privacy</legend>
          <p className="small-note">Making your profile public shares the details and images above. Your login email and contact phone stay hidden unless you choose to share them separately. Achievements are self-reported.</p>
          <label><input type="checkbox" checked={values.is_public} disabled={saving} onChange={e=>change('is_public',e.target.checked)}/>Make my profile public</label>
          <label><input type="checkbox" checked={values.show_email} disabled={saving} onChange={e=>change('show_email',e.target.checked)}/>Show my email on my public profile</label>
          <Field name="contact_phone" label="Contact phone (optional)" type="tel" required={false} maxLength={40} value={values.contact_phone} disabled={saving} error={fieldError('contact_phone')} onChange={e=>change('contact_phone',e.target.value)}/>
          <label><input type="checkbox" checked={values.show_phone} disabled={saving} onChange={e=>change('show_phone',e.target.checked)}/>Show my contact phone on my public profile</label>
        </fieldset>
        {formError && <Notice error>{formError}</Notice>}
        <div className="form-actions"><button type="button" className="button-secondary" disabled={saving} onClick={onCancel}>Cancel</button>
          <button type="submit" className="button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}<Icon name={saving ? 'clock' : 'checkcircle2'} className="w-4 h-4" /></button></div>
      </form>
    </Panel>;
  }
  function AccountProfile({ role, account, requestApi, setAccountState, notify }) {
    const profile = account.profile || {};
    const participant = role === 'participant';
    const organizer = role === 'organizer';
    const [editing,setEditing] = useState(false);
    const name = participant ? (profile.full_name || account.display_name) :
      organizer ? (profile.organization_name || account.display_name) : (profile.recruiter_name || account.display_name);
    const subtitle = participant ? profile.current_status : organizer ? profile.organizer_type : profile.recruiter_designation;
    const fields = participant ? [
      ['Full name', profile.full_name || account.display_name],
      ['Email', account.email],
      ['Current status', profile.current_status],
      ['University, college, school, or workplace', profile.institution_name],
      ['Department', profile.department], ['Graduation year', profile.graduation_year],
      ['Codeforces handle', profile.codeforces_handle], ['AtCoder handle', profile.atcoder_handle],
      ['Competition achievements (self-reported)', profile.achievements], ['Portfolio', profile.portfolio_url],
      ['Bio', profile.bio],
      ['Skills', profile.skills],
      ['GitHub URL', profile.github_url],
      ['LinkedIn URL', profile.linkedin_url],
      ['Opportunity availability', profile.availability_preferences],
      ['Education', profile.education_info],
      ['Work experience', profile.work_experience],
      ['Profile visibility', profile.is_public]
    ] : organizer ? [
      ['Contact person', profile.contact_name],
      ['Organization name', profile.organization_name],
      ['Organizer type', profile.organizer_type],
      ['Affiliated with an institution', profile.is_affiliated ? 'Yes' : 'No'],
      ['Institution', profile.institution_name],
      ['Department', profile.department],
      ['Club or organization', profile.club_organization_name],
      ['Website', profile.website_url],
      ['Description', profile.description],
      ['Profile visibility', profile.is_public]
    ] : [
      ['Hiring interests', profile.hiring_interests], ['LinkedIn', profile.linkedin_url],
      ['Recruiter name', profile.recruiter_name],
      ['Company name', profile.company_name],
      ['Designation', profile.recruiter_designation],
      ['Company website', profile.company_website],
      ['Company description', profile.company_description],
      ['Profile visibility', profile.is_public]
    ];
    const initials = String(name || '?').trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '?';
    if (editing) return <ProfileEditForm role={role} account={account} requestApi={requestApi} onCancel={()=>setEditing(false)}
      onSaved={updated=>{setAccountState({status:'loaded',account:updated});setEditing(false);notify('Your profile was saved to your Django account.');}}/>;
    return <><div className="profile-preview-card"><div className="profile-monogram">{profile.photo_url?<img src={profileMediaUrl(profile.photo_url)} alt={organizer?'Organization logo':'Profile photo'}/>:initials}</div><div>
        <span className="eyebrow">{role} ACCOUNT PROFILE</span><h2>{name}</h2><p>{subtitle || account.email}</p>
      </div><Badge>Django account</Badge></div>
      {new URLSearchParams(window.location.search).get('photo')==='retry'&&!profile.photo_url&&<Notice>Your account was created and you are signed in. The signup photo could not be saved; choose a valid image below to try again.</Notice>}
      {!account.profile && <Notice>This account does not have a saved {role} profile yet. The displayed name comes from the signed-in account.</Notice>}
      <div className="profile-edit-actions">{account.profile && <button type="button" className="button-secondary" onClick={()=>setEditing(true)}>Edit Profile</button>}</div>
      {account.profile&&<><ProfileImages role={role} account={account} onSaved={updated=>setAccountState({status:'loaded',account:updated})}/>
        <Panel title="Profile sharing" icon="shieldcheck"><p>{profile.is_public?'Your profile is public.':'Your profile is private. Only you can see it.'} {profile.show_email?'Email sharing is enabled.':'Your email is hidden from public profiles.'} {profile.show_phone?'Phone sharing is enabled.':'Your phone is hidden from public profiles.'}</p>
          {profile.is_public&&<Link className="inline-link" to={'/profiles/'+account.id}>Open public profile →</Link>}
          {organizer&&<p><Link className="inline-link" to="/workspace?role=organizer&tab=competitions">Manage your competitions →</Link></p>}
        </Panel></>}
      <ProfileDetails fields={fields}/>
      <p className="preview-notice"><Icon name="info" className="w-4 h-4"/><span>These details are read from your signed-in Django account. Changes you save here update your account profile.</span></p>
    </>;
  }
  function SampleProfile({ role, db, setDb, notify, explanation }) {
    const key = role === 'participant' ? 'profile' : role === 'organizer' ? 'organizer' : 'company';
    const fields = role === 'participant' ? [
      {name:'name',label:'Full name'}, {name:'headline',label:'Headline'}, {name:'institution',label:'Institution / workplace'},
      {name:'skills',label:'Skills',hint:'Separate skills with commas.'}, {name:'github',label:'GitHub profile',type:'url',required:false},
      {name:'linkedin',label:'LinkedIn profile',type:'url',required:false}, {name:'bio',label:'About you',type:'textarea'}
    ] : [
      {name:'name',label:role==='organizer'?'Organization name':'Company name'}, {name:'website',label:'Website',type:'url'},
      {name:role==='organizer'?'institution':'location',label:role==='organizer'?'Institution / affiliation':'Location'},
      {name:'bio',label:role==='organizer'?'About the organization':'About the company',type:'textarea'}
    ];
    const name = db[key].name || 'Sample profile';
    const initials = String(name).trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '?';
    return <><Notice>{explanation || 'You are not signed in. This sample profile is a local preview and is not connected to an account.'}</Notice>
      <div className="profile-preview-card"><div className="profile-monogram">{initials}</div><div><span className="eyebrow">SAMPLE {role} PROFILE</span><h2>{name}</h2><p>{db[key].headline || db[key].bio}</p></div><Badge>Sample preview</Badge></div>
      <DemoForm key={role} title="Edit sample profile preview" initial={db[key]} fields={fields} onSave={values=>{setDb(d=>({...d,[key]:values}));notify('Sample profile saved in this browser only.');}} />
    </>;
  }
  function Profile({ role, db, setDb, notify, accountState, account, requestApi, setAccountState }) {
    if (accountState.status === 'loading') return <Panel title="Loading profile" icon="user"><p>Checking the current Django account…</p></Panel>;
    if (accountState.status === 'error') return <Panel title="Profile unavailable" icon="user"><Notice error>The current Django account could not be verified. Reload this page after the account service is available to view your saved profile.</Notice></Panel>;
    if (accountState.status === 'signed-out') return <SampleProfile role={role} db={db} setDb={setDb} notify={notify} explanation="You are not signed in. This sample profile is a local preview and is not connected to an account."/>;
    if (account && account.role === role) return <AccountProfile role={role} account={account} requestApi={requestApi} setAccountState={setAccountState} notify={notify}/>;
    if (account) return <Panel title="Opening your account workspace" icon="user"><p>Loading the workspace for your signed-in account…</p></Panel>;
    return <Panel title="Profile unavailable" icon="user"><Notice error>The account response did not include a verified profile. Reload this page to try again.</Notice></Panel>;
  }
  function SavedEvents() {
    const [ids,setIds] = useState(()=>{const saved=readStored('talentsphere-saved',[]);return Array.isArray(saved)?saved:[];});
    const [error,setError]=useState('');
    const entries=[...DATA.competitions.map(c=>({...c,path:'/competitions/'+c.id,kind:'Competition'})),...DATA.jobFairs.map(f=>({...f,path:'/job-fairs/'+f.id,kind:'Job fair'}))].filter(e=>ids.includes(e.id));
    return <Panel title="Keep something good for later" icon="sparkles">{error&&<Notice error>{error}</Notice>}{entries.length?entries.map(e=><ListItem key={e.id} title={e.title} subtitle={e.organizer} badge={e.kind} actions={<><Link className="work-text-button" to={e.path}>View details →</Link><button className="work-text-button muted" onClick={()=>{
      const next=ids.filter(id=>id!==e.id);try{localStorage.setItem('talentsphere-saved',JSON.stringify(next));setIds(next);}catch{setError('Your browser could not update saved events.');}
    }}>Remove saved event</button></>}/>):<EmptyState title="Your next favorite is out there" text="Save an event from its detail page and it will appear here." />}
      <Link className="inline-link" to="/competitions">Explore competitions →</Link></Panel>;
  }
  async function readActivityPages(path) {
    const rows=[];
    for(let page=0;path;page++){
      if(page>=100)throw new Error('There are too many activity records for this view. Contact support.');
      const data=await requestApi(path);rows.push(...(data.results||[]));
      if(data.next){const url=new URL(data.next,window.location.origin);if(!/^\/api\/(participant|organizer)\//.test(url.pathname))throw new Error('Invalid activity page.');path=url.pathname.slice(4)+url.search;}else path=null;
    }
    return rows;
  }

  function RealParticipantCompetitions({savedOnly=false}) {
    const [state,setState]=useState({status:'loading',items:[]}),[section,setSection]=useState(savedOnly?'saved':'all'),[query,setQuery]=useState(''),[revision,setRevision]=useState(0),[busy,setBusy]=useState(''),[message,setMessage]=useState('');
    useEffect(()=>{
      let active=true;setState(s=>({...s,status:'loading'}));
      Promise.all([readActivityPages('/participant/bookmarks/?page_size=60'),readActivityPages('/participant/registrations/?page_size=60'),readActivityPages('/participant/participations/?page_size=60')]).then(([saved,registrations,reports])=>{
        const map=new Map();const entry=c=>{if(!map.has(c.id))map.set(c.id,{...c});return map.get(c.id);};
        saved.forEach(r=>entry(r.competition).bookmark=r);registrations.forEach(r=>entry(r.competition).registration=r);reports.forEach(r=>entry(r.competition).report=r);
        if(active)setState({status:'ready',items:[...map.values()]});
      }).catch(error=>{if(active)setState({status:'error',items:[],error:error.message});});
      return()=>{active=false;};
    },[revision]);
    async function action(key,path,method){if(busy)return;setBusy(key);setMessage('');try{await requestApi(path,{method,body:{}});setMessage(method==='DELETE'&&path.includes('/registrations/')?'Registration withdrawn; history retained.':'Bookmark removed.');setRevision(r=>r+1);}catch(error){setMessage(error.message);}finally{setBusy('');}}
    if(state.status==='loading')return <Panel title="Loading your competition activity" icon="clock"><p role="status">Reading your saved Django records…</p></Panel>;
    if(state.status==='error')return <Panel title="Competition activity unavailable" icon="info"><Notice error>{state.error}</Notice><button className="button-secondary" onClick={()=>setRevision(r=>r+1)}>Try again</button></Panel>;
    const counts={saved:state.items.filter(i=>i.bookmark).length,internal:state.items.filter(i=>i.registration?.registration_status==='active').length,external:state.items.filter(i=>i.report?.reported_status==='registered_external').length};
    const visible=state.items.filter(i=>[i.title,i.category,i.source_name,i.organizer].join(' ').toLowerCase().includes(query.toLowerCase())&&(section==='all'||section==='saved'&&i.bookmark||section==='internal'&&i.registration||section==='upcoming'&&i.event_start_date&&new Date(i.event_start_date)>new Date()||i.report?.reported_status===section));
    return <><Stats items={[{label:'Interested / bookmarked',value:counts.saved,icon:'sparkles',detail:'Saved to your Participant account'},{label:'Registered on Talent Square',value:counts.internal,icon:'trophy',detail:'Active internal registrations'},{label:'Registered externally',value:counts.external,icon:'code2',detail:'Self-reported; not verified'}]}/>
      <Panel title={savedOnly?'Saved competitions':'My Competitions'} icon="trophy"><p className="small-note">Real account records. External activity is self-reported — not verified by Talent Square. Browser-only preview saves are not imported.</p>
        <Toolbar query={query} onQuery={setQuery} placeholder="Search your competition activity"><select className="form-input" aria-label="Activity section" value={section} onChange={e=>setSection(e.target.value)}>{[['all','All activity'],['saved','Saved / Interested'],['internal','Talent Square registrations (including withdrawn)'],['interested','Interested externally'],['planning','Planning to Register'],['registered_external','Registered Externally — Self-Reported'],['participated','Participated — Self-Reported'],['completed','Completed — Self-Reported'],['upcoming','Upcoming Competitions']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Toolbar>
        {message&&<p role="status">{message}</p>}
        {visible.map(item=><ListItem key={item.id} title={item.title} subtitle={[item.category,item.event_start_date?new Date(item.event_start_date).toLocaleString():'Date not provided',item.source_name||item.organizer].filter(Boolean).join(' · ')} badge={item.registration_mode==='internal'?'Internal registration':'External registration'}>
          {item.bookmark&&<p>Interested / bookmarked</p>}{item.registration&&<p>{item.registration.status_label} · {new Date(item.registration.registered_at).toLocaleString()}</p>}{item.report&&<><p>{item.report.status_label}</p><p className="small-note">{item.report.notice}</p></>}
          <div className="work-item-actions">{item.available!==false&&<Link className="inline-link" to={'/competitions/'+item.id}>Competition details / update activity →</Link>}{item.bookmark&&<button className="button-secondary" disabled={!!busy} onClick={()=>action('bookmark-'+item.id,`/participant/competitions/${item.id}/bookmark/`,'DELETE')}>Remove bookmark</button>}
          {item.registration?.registration_status==='active'&&new Date(item.event_start_date)>new Date()&&<button className="button-secondary" disabled={!!busy} onClick={()=>{if(window.confirm('Withdraw this registration? It cannot be reopened.'))action('registration-'+item.id,`/participant/registrations/${item.registration.id}/`,'DELETE');}}>Withdraw registration</button>}</div>
        </ListItem>)}
        {!visible.length&&<EmptyState title="No competition activity here yet" text="Explore published competitions to bookmark, register internally, or add a self-reported external status."/>}
      </Panel></>;
  }

  function RealOrganizerParticipants() {
    const [events,setEvents]=useState([]),[selected,setSelected]=useState(''),[rows,setRows]=useState([]),[status,setStatus]=useState('loading'),[error,setError]=useState('');
    useEffect(()=>{let active=true;readActivityPages('/organizer/competitions/?page_size=60').then(items=>{if(active){const internal=items.filter(i=>i.registration_mode==='internal');setEvents(internal);setSelected(internal[0]?String(internal[0].id):'');setStatus('ready');}}).catch(e=>{if(active){setError(e.message);setStatus('error');}});return()=>{active=false;};},[]);
    useEffect(()=>{let active=true;if(!selected)return;setStatus('loading');readActivityPages(`/organizer/competitions/${selected}/registrations/?page_size=60`).then(items=>{if(active){setRows(items);setStatus('ready');}}).catch(e=>{if(active){setError(e.message);setStatus('error');}});return()=>{active=false;};},[selected]);
    return <Panel title="Internal competition registrations" icon="users"><p className="small-note">Only registrations for your own internal competitions. External reports are private to Participants; emails and unrelated profile details are not shown.</p><label className="work-label">Your competition<select className="form-input" aria-label="Your internal competition" value={selected} onChange={e=>setSelected(e.target.value)}>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
      {status==='loading'?<p role="status">Loading registrations…</p>:status==='error'?<Notice error>{error}</Notice>:<><div className="work-table-wrap"><table className="work-table"><thead><tr><th>Participant</th><th>Registered</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.participant_name}</td><td>{new Date(r.registered_at).toLocaleString()}</td><td>{r.status_label}{r.withdrawn_at&&' · '+new Date(r.withdrawn_at).toLocaleString()}</td></tr>)}</tbody></table></div>{!rows.length&&<EmptyState title={events.length?'No registrations yet':'No internal competitions'} text="Internal registration must be selected in an organizer submission and approved before Participants can register."/>}</>}
    </Panel>;
  }

  function ParticipantCompetitions({db,setDb,notify}) {
    const [selected,setSelected]=useState('');
    return <><Panel title="Your competition journey" icon="trophy">{db.registrations.map(r=>{
      const c=DATA.competitions.find(c=>c.id===r.competitionId);
      return c&&<ListItem key={r.id} title={c.title} subtitle={r.team+' · '+c.date} badge={r.status} actions={<><Link className="work-text-button" to={'/competitions/'+c.id}>Event details →</Link><button className="button-secondary" onClick={()=>setSelected(selected===r.id?'':r.id)}>{selected===r.id?'Close workspace':'Open workspace'}</button></>}>
        {selected===r.id&&<div className="work-expanded"><p>Keep your team details and project link together. This sample submission is stored locally.</p>
          <DemoForm title="Your entry" initial={{team:r.team,submission:r.submission}} fields={[{name:'team',label:'Team name'},{name:'submission',label:'Project / repository link',type:'url',placeholder:'https://github.com/your-team/project'}]}
            button="Save submission preview" onSave={v=>{setDb(d=>({...d,registrations:d.registrations.map(x=>x.id===r.id?{...x,...v,status:'Submitted (preview)'}:x)}));notify('Submission preview saved on this device.');setSelected('');}} />
        </div>}</ListItem>;
    })}</Panel><Link className="button-secondary" to="/competitions">Find another challenge <Icon name="arrowright" className="w-4 h-4"/></Link></>;
  }
  function Applications({db,setDb,notify,recruiter=false}) {
    const [query,setQuery]=useState(''),[status,setStatus]=useState('All statuses');
    const rows=db.applications.filter(a=>(recruiter||a.name===db.profile.name||a.id==='a1')&&(status==='All statuses'||a.status===status)&&
      [a.name,db.jobs.find(j=>j.id===a.jobId)?.title,a.skills].join(' ').toLowerCase().includes(query.toLowerCase()));
    return <Panel title={recruiter?'People behind the applications':'Your applications'} icon="briefcase">
      <Toolbar query={query} onQuery={setQuery} placeholder="Search applications"><select aria-label="Application status" className="form-input" value={status} onChange={e=>setStatus(e.target.value)}>{['All statuses','Applied','Shortlisted','Interview','Not selected','Withdrawn'].map(s=><option key={s}>{s}</option>)}</select></Toolbar>
      {rows.length?rows.map(a=><ListItem key={a.id} title={recruiter?a.name:db.jobs.find(j=>j.id===a.jobId)?.title||'Opportunity no longer available'} subtitle={recruiter?(db.jobs.find(j=>j.id===a.jobId)?.title||'Opportunity')+' · '+a.skills:'Northstar Labs · Sample application'} badge={a.status}
        actions={recruiter?<label className="inline-select-label">Review status<select aria-label={'Status for '+a.name} className="form-input" value={a.status} onChange={e=>{const value=e.target.value;setDb(d=>({...d,applications:d.applications.map(x=>x.id===a.id?{...x,status:value}:x)}));notify('Application status updated in this preview. No applicant was contacted.');}}>
          {['Applied','Shortlisted','Interview','Not selected','Withdrawn'].map(s=><option key={s}>{s}</option>)}</select></label>:
          a.status!=='Withdrawn'&&<button className="work-text-button" onClick={()=>{setDb(d=>({...d,applications:d.applications.map(x=>x.id===a.id?{...x,status:'Withdrawn'}:x)}));notify('Sample application withdrawn.');}}>Withdraw sample application</button>}/>):<EmptyState title="No matching applications" text="Try another name, opportunity, or status." onReset={()=>{setQuery('');setStatus('All statuses');}}/>}
    </Panel>;
  }
  function OrganizerCompetitions({db,setDb,notify}) {
    const [editing,setEditing]=useState(null),[query,setQuery]=useState('');
    const draft=readStored('talentsphere-competition-draft',{});
    return <><div className="work-section-action"><Link className="button-primary" to={route('organizer','create')}><Icon name="rocket" className="w-4 h-4"/>Create competition</Link></div>
      {editing&&<DemoForm key={editing.id} title="Edit event details" initial={editing} fields={[{name:'title',label:'Competition title'},{name:'date',label:'Event date',type:'date'},{name:'description',label:'Description',type:'textarea'}]}
        onSave={v=>{setDb(d=>({...d,events:d.events.map(e=>e.id===editing.id?{...e,...v}:e)}));setEditing(null);notify('Event details saved in this preview.');}}><button type="button" className="work-text-button" onClick={()=>setEditing(null)}>Cancel editing</button></DemoForm>}
      <Panel title="Your events" icon="trophy"><Toolbar query={query} onQuery={setQuery} placeholder="Search your competitions"/>
        {draft?.title&&<ListItem title={draft.title} subtitle="Saved on this device" badge="Local draft" actions={<Link className="work-text-button" to={route('organizer','create')}>Continue draft →</Link>}/>}
        {db.events.filter(e=>e.title.toLowerCase().includes(query.toLowerCase())).map(e=><ListItem key={e.id} title={e.title} subtitle={e.date+' · '+e.registrations+' sample registrations'} badge={e.status} actions={<>
          <button className="work-text-button" onClick={()=>setEditing(e)}>Edit details</button><Link className="work-text-button" to={route('organizer','participants')}>Participants →</Link>
          <button className="work-text-button muted" onClick={()=>{setDb(d=>({...d,events:d.events.map(x=>x.id===e.id?{...x,status:x.status==='Paused'?'Under review':'Paused'}:x)}));notify('Competition status updated in this preview.');}}>{e.status==='Paused'?'Return to review':'Pause event'}</button></>}/>)}
        {!db.events.some(e=>e.title.toLowerCase().includes(query.toLowerCase()))&&<EmptyState title="No events match" text="Try a different competition title." onReset={()=>setQuery('')}/>}
      </Panel></>;
  }
  function RealOrganizerCompetitions({requestApi,accountState,account}) {
    const [items,setItems]=useState([]),[loadState,setLoadState]=useState('loading'),[query,setQuery]=useState(''),[statusFilter,setStatusFilter]=useState('All');
    const [editing,setEditing]=useState(null),[loadError,setLoadError]=useState('');
    useEffect(()=>{
      let active=true;
      if(accountState.status!=='loaded'||account?.role!=='organizer'){
        setLoadState(accountState.status==='loading'?'loading':accountState.status==='error'?'error':'signed-out');
        return()=>{active=false;};
      }
      setLoadState('loading');setLoadError('');
      requestApi('/organizer/competitions/?page_size=60').then(result=>{
        if(active){setItems(result.results||[]);setLoadState('ready');}
      }).catch(error=>{
        if(active){setLoadError(error.message||'Your competition submissions could not be loaded.');setLoadState('error');}
      });
      return()=>{active=false;};
    },[requestApi,accountState.status,account?.role]);
    function onSaved(saved){
      setItems(current=>current.some(item=>item.id===saved.id)?current.map(item=>item.id===saved.id?saved:item):[saved,...current]);
      setEditing(null);
    }
    if(editing)return <SubmitCompetitionPage embedded accountState={accountState} account={account} submission={editing} onSaved={onSaved} onCancel={()=>setEditing(null)}/>;
    if(loadState==='loading')return <Panel title="Loading your competitions" icon="clock"><p>Getting submissions linked to your Django Organizer account…</p></Panel>;
    if(loadState==='error')return <Panel title="Your competitions are unavailable" icon="info"><Notice error>{loadError||'The Django service could not verify your submissions.'}</Notice></Panel>;
    if(loadState==='signed-out')return <Panel title="Organizer sign-in required" icon="shieldcheck"><p>Sign in as an Organizer to create and manage Django-backed competition submissions.</p><div className="form-actions"><Link className="button-primary" to={'/login?next='+encodeURIComponent('/workspace?role=organizer&tab=competitions')}>Sign in</Link><Link className="button-secondary" to="/signup?role=organizer">Create Organizer account</Link></div></Panel>;
    const visible=items.filter(item=>(statusFilter==='All'||item.submission_status===statusFilter)&&[item.title,item.host_organization,item.category].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
    const counts=['Draft','Pending Review','Published','Rejected'].map(status=>({status,count:items.filter(item=>item.submission_status===status).length}));
    const date=value=>value?new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}):'Date not set';
    return <>
      <div className="work-section-action"><Link className="button-primary" to={route('organizer','create')}><Icon name="rocket" className="w-4 h-4"/>Create competition</Link></div>
      <div className="profile-edit-status-grid">{counts.map(item=><Panel key={item.status} title={item.status} icon="trophy"><strong>{item.count}</strong></Panel>)}</div>
      <Panel title="My Competitions" icon="trophy"><Toolbar query={query} onQuery={setQuery} placeholder="Search your competitions">
        <select className="form-input" aria-label="Filter by submission status" value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}>{['All','Draft','Pending Review','Published','Rejected'].map(status=><option key={status}>{status}</option>)}</select>
      </Toolbar>
        {visible.map(item=><ListItem key={item.id} title={item.title||'Untitled draft'} subtitle={`${item.category||'CSE category not set'} · ${date(item.event_start_date)} · ${item.host_organization||'Host not set'}`} badge={item.submission_status} actions={item.editable&&<button type="button" className="work-text-button" onClick={()=>setEditing(item)}>Edit and resubmit</button>}>
          <p className="work-item-copy">Host type: {item.host_type==='university'?'University-hosted':item.host_type==='outside_university'?'Outside-university':'Not set'}{item.university_name?` · ${item.university_name}`:''}</p>
          {item.review_notes&&<div className="import-warning"><Icon name="info" className="w-4 h-4"/>Administrator note: {item.review_notes}</div>}
          {!item.editable&&item.submission_status==='Pending Review'&&<p className="small-note">This submission is locked while it is being reviewed.</p>}
          {item.submission_status==='Published'&&<Link className="inline-link" to={'/competitions/'+item.id}>View public listing →</Link>}
        </ListItem>)}
        {!visible.length&&<EmptyState title={items.length?'No submissions match':'No competitions submitted yet'} text={items.length?'Change the status filter or search another title.':'Create a competition to save a draft or send it to administrator review.'}/>}
      </Panel>
    </>;
  }
  function Participants({db,setDb,notify,results=false}) {
    const [query,setQuery]=useState('');
    return <Panel title={results?'Prepare competition results':'Your participants'} icon={results?'trendingup':'users'}>
      <Toolbar query={query} onQuery={setQuery} placeholder="Search participants or teams"/>
      <div className="work-table-wrap"><table className="work-table"><thead><tr><th>Participant / team</th><th>Competition</th><th>{results?'Score (0–100)':'Registration'}</th></tr></thead>
        <tbody>{db.participants.filter(p=>[p.name,p.team].join(' ').toLowerCase().includes(query.toLowerCase())).map(p=><tr key={p.id}><td><strong>{p.name}</strong><small>{p.team}</small></td><td>{p.event}</td><td>{results?
          <input className="form-input score-input" aria-label={'Score for '+p.name} type="number" min="0" max="100" value={p.score} onChange={e=>{const value=e.target.value;setDb(d=>({...d,participants:d.participants.map(x=>x.id===p.id?{...x,score:value}:x)}));}}/>:
          <select className="form-input" aria-label={'Registration for '+p.name} value={p.status} onChange={e=>{const value=e.target.value;setDb(d=>({...d,participants:d.participants.map(x=>x.id===p.id?{...x,status:value}:x)}));notify('Sample registration updated.');}}>{['Confirmed','Pending','Cancelled'].map(s=><option key={s}>{s}</option>)}</select>}</td></tr>)}</tbody></table></div>
      {!db.participants.some(p=>[p.name,p.team].join(' ').toLowerCase().includes(query.toLowerCase()))&&<EmptyState title="No participants match" text="Try another participant or team name."/>}
      {results&&<div className="results-submit"><p>Scores are a local preview. Send complete results to the admin review queue before they affect any standings.</p><button className="button-primary" onClick={()=>{
        if(db.participants.some(p=>p.score===''||!Number.isFinite(Number(p.score))||Number(p.score)<0||Number(p.score)>100)){notify('Enter a score from 0 to 100 for every participant.',true);return;}
        setDb(d=>({...d,results:[{id:uid('result'),event:'Campus Innovation Sprint',status:'Pending',entries:d.participants.map(p=>({name:p.name,team:p.team,score:Number(p.score)})),time:stamp()},...d.results]}));notify('Sample results added to the admin review queue.');
      }}>Send results for review</button></div>}
    </Panel>;
  }
  function Opportunities({db,setDb,notify}) {
    const [editor,setEditor]=useState(null),[query,setQuery]=useState('');
    return <><div className="work-section-action"><button className="button-primary" onClick={()=>setEditor({id:uid('job'),title:'',type:'Internship',location:'',description:'',skills:'',status:'Draft'})}>Create opportunity <Icon name="arrowright" className="w-4 h-4"/></button></div>
      {editor&&<DemoForm key={editor.id} title={db.jobs.some(j=>j.id===editor.id)?'Edit opportunity':'A new opportunity'} initial={editor} fields={[{name:'title',label:'Role title'},{name:'type',label:'Employment type',options:['Internship','Full-time','Part-time','Contract']},{name:'location',label:'Location / work arrangement'},{name:'skills',label:'Required skills'},{name:'description',label:'Role description',type:'textarea'}]} button="Save opportunity"
        onSave={v=>{setDb(d=>({...d,jobs:d.jobs.some(j=>j.id===editor.id)?d.jobs.map(j=>j.id===editor.id?{...editor,...v}:j):[...d.jobs,{...editor,...v}]}));setEditor(null);notify('Opportunity saved on this device.');}}><button type="button" className="work-text-button" onClick={()=>setEditor(null)}>Cancel</button></DemoForm>}
      <Panel title="Opportunities at your company" icon="briefcase"><Toolbar query={query} onQuery={setQuery} placeholder="Search opportunities"/>
        {db.jobs.filter(j=>j.title.toLowerCase().includes(query.toLowerCase())).map(j=><ListItem key={j.id} title={j.title} subtitle={j.type+' · '+j.location} badge={j.status} actions={<><button className="work-text-button" onClick={()=>setEditor(j)}>Edit role</button>
          <Link className="work-text-button" to={route('recruiter','applicants')}>Review applicants →</Link><button className="button-secondary" onClick={()=>{setDb(d=>({...d,jobs:d.jobs.map(x=>x.id===j.id?{...x,status:x.status==='Open'?'Closed':'Open'}:x)}));notify('Opportunity status updated in this preview.');}}>{j.status==='Open'?'Close role':'Open role preview'}</button></>}><p className="work-item-copy">{j.description}</p></ListItem>)}
        {!db.jobs.some(j=>j.title.toLowerCase().includes(query.toLowerCase()))&&<EmptyState title="No opportunities match" text="Try another role title."/>}
      </Panel></>;
  }
  function Talent({db,setDb,notify}) {
    const [query,setQuery]=useState(''),[shortlist,setShortlist]=useState(false);
    const people=DATA.rankings.topTalent.filter(p=>(!shortlist||db.shortlisted.includes(p.handle))&&[p.name,p.title,p.institution,p.category,...p.badges].join(' ').toLowerCase().includes(query.toLowerCase()));
    return <Panel title="People with something to show" icon="users"><Toolbar query={query} onQuery={setQuery} placeholder="Search names, skills, or institutions">
      <button className="button-secondary" aria-pressed={shortlist} onClick={()=>setShortlist(!shortlist)}>{shortlist?'Show all talent':'Show shortlist'}</button></Toolbar>
      <p className="work-muted">Sample profiles illustrate talent discovery. Real visibility will follow each participant's privacy settings.</p>
      <div className="talent-grid">{people.map(p=><article className="talent-card" key={p.handle}><div className="profile-monogram small">{p.name.split(' ').map(w=>w[0]).join('')}</div><h3>{p.name}</h3><span>{p.title}</span><p>{p.institution}</p><div className="tag-list">{p.badges.slice(0,2).map(b=><span key={b}>{b}</span>)}</div><small>{p.availability}</small>
        <button className="button-secondary full-width" aria-pressed={db.shortlisted.includes(p.handle)} onClick={()=>{setDb(d=>({...d,shortlisted:d.shortlisted.includes(p.handle)?d.shortlisted.filter(h=>h!==p.handle):[...d.shortlisted,p.handle]}));notify('Talent shortlist updated on this device.');}}>{db.shortlisted.includes(p.handle)?'Remove from shortlist':'Save to shortlist'}</button></article>)}</div>
      {!people.length&&<EmptyState title="No profiles match" text="Try another search or return to all talent." onReset={()=>{setQuery('');setShortlist(false);}}/>}
    </Panel>;
  }
  function WorkspaceAccountSummary({role, account}) {
    const profile = account.profile || {};
    const participant = role === 'participant';
    const organizer = role === 'organizer';
    const name = participant ? (profile.full_name || account.display_name) :
      organizer ? (profile.organization_name || account.display_name) : (profile.company_name || account.display_name);
    const details = participant ? [profile.current_status, profile.institution_name] :
      organizer ? [profile.organizer_type, profile.institution_name] : [profile.recruiter_name, profile.recruiter_designation];
    const initials = String(name || '?').trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '?';
    return <div className="workspace-account-summary">
      <div className="profile-preview-card"><div className="profile-monogram">{initials}</div><div>
        <span className="eyebrow">SIGNED-IN {role.toUpperCase()} ACCOUNT</span><h2>{name}</h2>
        <p>{details.filter(Boolean).join(' · ') || account.email}</p>
      </div><Badge>From Django</Badge></div>
      <Link className="inline-link" to={route(role, 'profile')}>View saved account profile →</Link>
    </div>;
  }
  function WorkspaceOverview({role,db,account,accountState,requestApi}) {
    const participant=role==='participant',organizer=role==='organizer';
    const [organizerCompetitions,setOrganizerCompetitions]=useState({status:'loading',count:0,results:[]});
    useEffect(()=>{
      if(!organizer)return;
      if(accountState?.status!=='loaded'||account?.role!=='organizer'){
        setOrganizerCompetitions({status:accountState?.status==='signed-out'?'signed-out':accountState?.status==='error'?'error':'loading',count:0,results:[]});
        return;
      }
      let active=true;
      setOrganizerCompetitions({status:'loading',count:0,results:[]});
      requestApi('/organizer/competitions/?page_size=60').then(result=>{
        if(active)setOrganizerCompetitions({status:'ready',count:result.count||0,results:Array.isArray(result.results)?result.results:[]});
      }).catch(()=>{
        if(active)setOrganizerCompetitions({status:'error',count:0,results:[]});
      });
      return()=>{active=false;};
    },[organizer,accountState?.status,account?.role,account?.email,requestApi]);
    const organizerCountLabel=organizerCompetitions.status==='ready'?organizerCompetitions.count:'—';
    const organizerStatusDetail=organizerCompetitions.status==='loading'?'Loading your Django submissions':
      organizerCompetitions.status==='signed-out'?'Sign in as an Organizer':
      organizerCompetitions.status==='error'?'Django submissions unavailable':
      organizerCompetitions.count>organizerCompetitions.results.length?'Latest 60 Django submissions':
      'Saved to your Django account';
    const organizerBreakdownAvailable=organizerCompetitions.status==='ready'&&organizerCompetitions.count<=organizerCompetitions.results.length;
    const items=participant?[{label:'Your competitions',value:db.registrations.length,icon:'trophy',detail:'Challenges on your calendar'},{label:'Active applications',value:db.applications.filter(a=>a.id==='a1'&&a.status!=='Withdrawn').length,icon:'briefcase',detail:'Your next career move'},{label:'Unread updates',value:db.notifications.filter(n=>!n.read).length,icon:'clock',detail:'Stay in the loop'}]:
      organizer?[{label:'Your competitions',value:organizerCountLabel,icon:'trophy',detail:organizerStatusDetail},{label:'Awaiting review',value:organizerBreakdownAvailable?organizerCompetitions.results.filter(item=>item.submission_status==='Pending Review').length:'—',icon:'clock',detail:organizerBreakdownAvailable?'Pending Django administrator review':'From Django submissions'},{label:'Drafts to finish',value:organizerBreakdownAvailable?organizerCompetitions.results.filter(item=>item.submission_status==='Draft'||item.submission_status==='Rejected').length:'—',icon:'clock',detail:organizerBreakdownAvailable?'Draft or rejected submissions':'From Django submissions'}]:
      [{label:'Open opportunities',value:db.jobs.filter(j=>j.status==='Open').length,icon:'briefcase',detail:'Make room for new talent'},{label:'Applications',value:db.applications.length,icon:'users',detail:'Meet your next teammates'},{label:'Saved talent',value:db.shortlisted.length,icon:'sparkles',detail:'People on your shortlist'}];
    return <>{account && account.role === role && <WorkspaceAccountSummary role={role} account={account}/>}<Stats items={items}/><div className="workspace-welcome"><div><span className="eyebrow">{participant?'KEEP YOUR MOMENTUM':organizer?'BRING PEOPLE TOGETHER':'BUILD YOUR NEXT GREAT TEAM'}</span>
      <h2>{participant?'Small steps. Big possibilities.':organizer?'Give great ideas a place to grow.':'The right people make the difference.'}</h2><p>{participant?'Find a challenge, polish your profile, and keep moving toward the work you want to do.':organizer?'Create a thoughtful competition and help a new community of builders find their next challenge.':'Create a clear opportunity and discover talent through the work they have already done.'}</p>
      <Link className="button-primary" to={participant?'/competitions':route(role,organizer?'create':'opportunities')}>{participant?'Find a competition':organizer?'Create a competition':'Manage opportunities'}<Icon name="arrowright" className="w-4 h-4"/></Link></div><div className="welcome-orbit"><Icon name={participant?'rocket':organizer?'trophy':'building2'} className="w-16 h-16"/></div></div>
      <div className="work-two-columns"><Panel title={participant?'On your radar':organizer?'Your next actions':'Your hiring checklist'} icon="checkcircle2"><ul className="work-action-list">
        {(participant?[['Review your competitions','competitions'],['Complete your profile','profile'],['Track your applications','applications']]:
          organizer?[['Review participant registrations','participants'],['Prepare competition results','results'],['Update organization details','profile']]:
          [['Review new applicants','applicants'],['Discover promising talent','talent'],['Update your company profile','profile']]).map(([label,target])=><li key={target}><Link to={route(role,target)}>{label}<span>→</span></Link></li>)}
      </ul></Panel><Panel title="Community notes" icon="sparkles"><div className="work-activity">{db.notifications.slice(0,3).map(n=><div key={n.id}><span className="activity-dot"/><div><strong>{n.title}</strong><p>{n.body}</p></div></div>)}</div></Panel></div></>;
  }
  function WorkspacePage({search}) {
    const params=new URLSearchParams(search),requestedRole=['participant','organizer','recruiter'].includes(params.get('role'))?params.get('role'):'participant';
    const requestedTab=params.get('tab');
    const [db,setDb,error]=useDemoStore(),[feedback,setFeedback]=useState(null);
    const [accountState,setAccountState]=useState({status:'loading',account:null});
    const account=accountState.status==='loaded'&&accountState.account?.authenticated?accountState.account:null;
    const role=account?account.role:requestedRole;
    const tab=menus[role].some(([id])=>id===requestedTab)?requestedTab:'overview';
    useEffect(()=>{
      let active=true,requestId=0;
      const loadAccount=async()=>{
        const currentRequest=++requestId;
        setAccountState({status:'loading',account:null});
        try{
          const account=await requestApi('/auth/me/');
          if(account?.authenticated!==true||!['participant','organizer','recruiter'].includes(account.role)||!account.display_name||!account.email){
            throw new Error('The account service returned an invalid account response.');
          }
          if(active&&currentRequest===requestId)setAccountState({status:'loaded',account});
        }catch(error){
          if(active&&currentRequest===requestId)setAccountState({status:error.status===401?'signed-out':'error',account:null});
        }
      };
      loadAccount();
      window.addEventListener('focus',loadAccount);
      return()=>{active=false;requestId+=1;window.removeEventListener('focus',loadAccount);};
    },[]);
    useEffect(()=>{
      if(!account||requestedRole===account.role)return;
      const nextTab=menus[account.role].some(([id])=>id===requestedTab)?requestedTab:'overview';
      window.history.replaceState({},'',route(account.role,nextTab));
      window.dispatchEvent(new PopStateEvent('popstate'));
    },[account,requestedRole,requestedTab]);
    useEffect(()=>setFeedback(null),[role,tab]);
    const notify=(text,error=false)=>setFeedback({text,error});
    const props={db,setDb,notify};
    let body;
    if(accountState.status==='loaded'&&account?.role==='participant'&&['overview','competitions','saved'].includes(tab))body=<><WorkspaceAccountSummary role={role} account={account}/><RealParticipantCompetitions key={tab} savedOnly={tab==='saved'}/></>;
    else if(['loading','error'].includes(accountState.status)&&role==='participant'&&['overview','competitions','saved'].includes(tab))body=<Panel title="Participant competition activity" icon="clock"><p>{accountState.status==='loading'?'Checking your Participant session?':'Account service unavailable. Reload to try again.'}</p></Panel>;
    else if(['loading','error'].includes(accountState.status)&&role==='organizer'&&tab==='participants')body=<Panel title="Organizer registrations" icon="clock"><p>{accountState.status==='loading'?'Checking your Organizer session?':'Account service unavailable. Reload to try again.'}</p></Panel>;
    else if(accountState.status==='loaded'&&account?.role==='organizer'&&tab==='participants')body=<RealOrganizerParticipants/>;
    else if(tab==='fairs')body=role==='organizer'?<window.TalentSquareJobFairUI.Organizer/>:<window.TalentSquareJobFairUI.Participant/>;
    else if(tab==='overview')body=<WorkspaceOverview role={role} db={db} account={account} accountState={accountState} requestApi={requestApi}/>;
    else if(tab==='profile')body=<Profile role={role} {...props} accountState={accountState} account={account} requestApi={requestApi} setAccountState={setAccountState}/>;
    else if(tab==='settings')body=<Settings {...props} requestApi={requestApi} navigate={navigate} accountState={accountState} account={account} setAccountState={setAccountState}/>;
    else if(tab==='notifications')body=<Notifications {...props}/>;
    else if(tab==='saved')body=<SavedEvents/>;
    else if(tab==='competitions')body=role==='organizer'?<RealOrganizerCompetitions requestApi={requestApi} accountState={accountState} account={account}/>:<ParticipantCompetitions {...props}/>;
    else if(tab==='create')body=<SubmitCompetitionPage embedded accountState={accountState} account={account} navigate={navigate}/>;
    else if(tab==='applications'||tab==='applicants')body=<Applications {...props} recruiter={role==='recruiter'}/>;
    else if(tab==='participants'||tab==='results')body=<Participants {...props} results={tab==='results'}/>;
    else if(tab==='opportunities')body=<Opportunities {...props}/>;
    else if(tab==='talent')body=<Talent {...props}/>;
    const heading=tab==='overview'?(role==='participant'?'Make your next move.':role==='organizer'?'Bring your community together.':'Find your next great teammate.'):menus[role].find(([id])=>id===tab)[1];
    return <Shell role={role} tab={tab} menu={menus[role]} heading={heading} onRoleChange={r=>navigate(route(r))} authenticated={!!account && account.role===role} allowRolePreview={accountState.status==='signed-out'}>
      {error&&<Notice error>{error}</Notice>}{feedback&&<div className="workspace-feedback"><Notice error={feedback.error}>{feedback.text}</Notice><button aria-label="Dismiss update" onClick={()=>setFeedback(null)}>×</button></div>}
      <div key={role+'-'+tab}>{body}</div>
    </Shell>;
  }
  function AdminOverview({db}) {
    return <><Stats items={[{label:'Submissions to review',value:db.approvals.filter(a=>a.status==='Pending').length,icon:'checkcircle2',detail:'Community announcements'},
      {label:'Imported drafts',value:db.imports.filter(i=>i.status==='Pending').length,icon:'eye',detail:'Ready for a closer look'},
      {label:'Enabled demo sources',value:db.sources.filter(s=>s.enabled).length,icon:'layoutgrid',detail:'Configuration previews only'}]}/>
      <div className="workspace-welcome"><div><span className="eyebrow">A WELL-KEPT COMMUNITY</span><h2>Good opportunities.<br/>Thoughtfully curated.</h2><p>Keep listings clear, sources accountable, and the community informed. Every approval starts with a closer look.</p><Link className="button-primary" to={adminRoute('approvals')}>Review submissions<Icon name="arrowright" className="w-4 h-4"/></Link></div><div className="welcome-orbit"><Icon name="shieldcheck" className="w-16 h-16"/></div></div>
      <div className="work-two-columns"><Panel title="Needs your attention" icon="clock"><ul className="work-action-list">
        <li><Link to={adminRoute('imports')}>Check imported competitions<span>{db.imports.filter(i=>i.status==='Pending').length} →</span></Link></li>
        <li><Link to={adminRoute('sources')}>Review source connections<span>→</span></Link></li>
        <li><Link to={adminRoute('rankings')}>Review competition results<span>{db.results.filter(r=>r.status==='Pending').length} →</span></Link></li>
      </ul></Panel><Panel title="Collection activity" icon="layoutgrid"><div className="work-activity">{db.history.slice(0,3).map(h=><div key={h.id}><span className="activity-dot"/><div><strong>{h.source}</strong><p>{h.detail}</p><Badge>{h.result}</Badge></div></div>)}</div></Panel></div></>;
  }
  function ApprovalQueue({db,setDb,notify}) {
    const [filter,setFilter]=useState('Pending'),[selected,setSelected]=useState('');
    const rows=db.approvals.filter(a=>filter==='All'||a.status===filter);
    function decide(item,status) {
      setDb(d=>({...d,approvals:d.approvals.map(a=>a.id===item.id?{...a,status}:a),events:d.events.map(e=>e.id===item.originId?{...e,status:status==='Approved'?'Approved (preview)':status==='Changes requested'?'Changes requested':'Rejected'}:e)}));
      notify('Submission marked '+status.toLowerCase()+' in this preview.');
    }
    return <Panel title="Community submissions" icon="checkcircle2"><div className="work-panel-actions"><span>{rows.length} submissions</span><select className="form-input" aria-label="Approval filter" value={filter} onChange={e=>setFilter(e.target.value)}>{['Pending','Approved','Changes requested','Rejected','All'].map(v=><option key={v}>{v}</option>)}</select></div>
      {rows.map(a=><ListItem key={a.id} title={a.title} subtitle={a.kind+' · '+a.organizer} badge={a.status} actions={<button className="work-text-button" onClick={()=>setSelected(selected===a.id?'':a.id)}>{selected===a.id?'Close review':'Review submission'}</button>}>
        {selected===a.id&&<div className="work-expanded"><p>{a.description}</p><label className="work-label">Review notes<textarea className="form-input" rows={3} value={a.notes} onChange={e=>{const notes=e.target.value;setDb(d=>({...d,approvals:d.approvals.map(x=>x.id===a.id?{...x,notes}:x)}));}} placeholder="What should the organizer know?"/></label>
          <div className="work-item-actions"><button className="button-primary" onClick={()=>decide(a,'Approved')}>Approve preview</button><button className="button-secondary" onClick={()=>decide(a,'Changes requested')}>Request changes</button><button className="work-text-button muted" onClick={()=>decide(a,'Rejected')}>Reject</button></div></div>}
      </ListItem>)}
      {!rows.length&&<EmptyState title="This queue is clear" text="Choose another status to see reviewed submissions."/>}
    </Panel>;
  }
  function People({db,setDb,notify}) {
    const [query,setQuery]=useState('');
    return <Panel title="People & organizations" icon="users"><Toolbar query={query} onQuery={setQuery} placeholder="Search names or account roles"/>
      {db.users.filter(u=>[u.name,u.role].join(' ').toLowerCase().includes(query.toLowerCase())).map(u=><ListItem key={u.id} title={u.name} subtitle={u.role+' · Sample account'} badge={u.status}
        actions={<button className="button-secondary" onClick={()=>{setDb(d=>({...d,users:d.users.map(x=>x.id===u.id?{...x,status:x.status==='Active'?'Paused':'Active'}:x)}));notify('Sample account status changed. No real account was affected.');}}>{u.status==='Active'?'Pause sample account':'Restore sample account'}</button>}/>)}
      {!db.users.some(u=>[u.name,u.role].join(' ').toLowerCase().includes(query.toLowerCase()))&&<EmptyState title="No accounts match" text="Try another name or role."/>}
    </Panel>;
  }
  function Sources({db,setDb,notify}) {
    const [editor,setEditor]=useState(null);
    function simulate(source) {
      const blocked=source.type==='Facebook'||!source.enabled;
      setDb(d=>({...d,history:[{id:uid('run'),time:stamp(),source:source.name,result:blocked?'Blocked':'Completed',
        detail:blocked?'Simulation only: source is paused or requires platform authorization. No request was sent.':'Simulation only: configuration checked. No content was fetched or new draft created.'},...d.history]}));
      notify(blocked?'Simulation recorded: enable a supported source before collection can be connected.':'Simulated check added to import history. No external website was contacted.',blocked);
    }
    return <><div className="work-section-action"><button className="button-primary" onClick={()=>setEditor({id:uid('source'),name:'',url:'',type:'RSS',interval:'Every 6 hours',enabled:false,status:'Configured (preview)'})}>Add source <Icon name="arrowright" className="w-4 h-4"/></button></div>
      {editor&&<DemoForm key={editor.id} title="Source configuration" initial={editor} fields={[{name:'name',label:'Source name'},{name:'url',label:'Source URL',type:'url',placeholder:'https://example.com/feed'},
        {name:'type',label:'Connection type',options:['RSS','API','Website','Facebook']},{name:'interval',label:'Check interval',options:['Hourly','Every 6 hours','Daily']}]} button="Save source" onSave={v=>{
          setDb(d=>({...d,sources:d.sources.some(s=>s.id===editor.id)?d.sources.map(s=>s.id===editor.id?{...editor,...v,status:v.type==='Facebook'?'Authorization required':'Configured (preview)',enabled:v.type==='Facebook'?false:editor.enabled}:s):[...d.sources,{...editor,...v,status:v.type==='Facebook'?'Authorization required':'Configured (preview)'}]}));setEditor(null);notify('Source configuration saved locally. Collection is not connected.');
        }}><p className="work-muted">Choose approved sources. Tokens and platform authorization will be handled by the backend; do not paste credentials here.</p><button className="work-text-button" type="button" onClick={()=>setEditor(null)}>Cancel</button></DemoForm>}
      <Panel title="Your discovery network" icon="layoutgrid">{db.sources.map(s=><ListItem key={s.id} title={s.name} subtitle={s.type+' · '+s.interval+' · '+s.url} badge={s.type==='Facebook'?'Authorization required':s.enabled?'Enabled (preview)':'Paused'}
        actions={<><button className="work-text-button" onClick={()=>setEditor(s)}>Edit source</button><button className="button-secondary" disabled={s.type==='Facebook'} title={s.type==='Facebook'?'Requires a supported backend connection':undefined} onClick={()=>{setDb(d=>({...d,sources:d.sources.map(x=>x.id===s.id?{...x,enabled:!x.enabled}:x)}));notify('Source preference updated locally.');}}>{s.enabled?'Pause':'Enable preview'}</button><button className="work-text-button" onClick={()=>simulate(s)}>Simulate check</button></>}>
        {s.type==='Facebook'&&<p className="work-item-copy">A supported Meta connection and the required permissions are needed. This frontend cannot connect a Page.</p>}
      </ListItem>)}</Panel></>;
  }
  function Imports({db,setDb,notify}) {
    const [filter,setFilter]=useState('Pending'),[editor,setEditor]=useState(null);
    const rows=db.imports.filter(i=>filter==='All'||i.status===filter);
    function decide(item,status) {
      if(status==='Approved'&&item.duplicateOf){notify('Resolve the duplicate by merging or rejecting this draft before approval.',true);return;}
      setDb(d=>({...d,imports:d.imports.map(i=>i.id===item.id?{...i,status}:i),history:[{id:uid('review'),time:stamp(),source:d.sources.find(s=>s.id===item.sourceId)?.name||'Imported draft',result:status,detail:item.title+' — '+status.toLowerCase()+' in the local preview.'},...d.history]}));
      notify('Import '+status.toLowerCase()+' in this preview. Public listings are unchanged.');
    }
    return <><Panel title="Imported competition drafts" icon="eye"><div className="work-panel-actions"><span>{rows.length} drafts</span><select className="form-input" aria-label="Import status" value={filter} onChange={e=>setFilter(e.target.value)}>{['Pending','Approved','Rejected','Merged','All'].map(s=><option key={s}>{s}</option>)}</select></div>
      {rows.map(i=><ListItem key={i.id} title={i.title} subtitle={(db.sources.find(s=>s.id===i.sourceId)?.name||'Unknown source')+' · '+i.organizer} badge={i.status}>
        <p className="work-item-copy">{i.description}</p><div className={'import-warning '+(i.duplicateOf?'duplicate':'')}><Icon name="info" className="w-4 h-4"/>{i.issue||'Check source details before publishing.'}</div>
        <dl className="import-facts"><div><dt>Event date</dt><dd>{i.date||'Not provided'}</dd></div><div><dt>Deadline</dt><dd>{i.deadline||'Not provided'}</dd></div><div><dt>Source</dt><dd><a href={i.sourceUrl} target="_blank" rel="noopener noreferrer">Original sample announcement ↗</a></dd></div></dl>
        <div className="work-item-actions"><button className="work-text-button" onClick={()=>setEditor(i)}>Edit extracted details</button>
          {i.status==='Pending'&&<>{i.duplicateOf?<button className="button-secondary" onClick={()=>decide(i,'Merged')}>Merge with existing event</button>:<button className="button-primary" onClick={()=>decide(i,'Approved')}>Approve preview</button>}<button className="work-text-button muted" onClick={()=>decide(i,'Rejected')}>Reject</button></>}
        </div>
      </ListItem>)}
      {!rows.length&&<EmptyState title="No drafts in this queue" text="Choose another status to review your decisions."/>}</Panel>
      {editor&&<DemoForm key={editor.id} title="Review extracted information" initial={editor} fields={[{name:'title',label:'Competition title'},{name:'organizer',label:'Organizer'},{name:'date',label:'Event date',type:'date',required:false},{name:'deadline',label:'Registration deadline',type:'date',required:false},{name:'description',label:'Description',type:'textarea'}]}
        onSave={v=>{
          if(v.deadline&&v.date&&v.deadline>v.date){notify('Registration deadline must be on or before the event date.',true);return;}
          setDb(d=>({...d,imports:d.imports.map(i=>i.id===editor.id?{...i,...v}:i)}));setEditor(null);notify('Extracted details updated on this device.');
        }}><button type="button" className="work-text-button" onClick={()=>setEditor(null)}>Cancel editing</button></DemoForm>}</>;
  }
  function ImportHistory({db}) {
    const [query,setQuery]=useState(''),[status,setStatus]=useState('All');
    const rows=db.history.filter(h=>(status==='All'||h.result===status)&&[h.source,h.detail].join(' ').toLowerCase().includes(query.toLowerCase()));
    return <Panel title="A record of every step" icon="clock"><Toolbar query={query} onQuery={setQuery} placeholder="Search import history"><select aria-label="History status" className="form-input" value={status} onChange={e=>setStatus(e.target.value)}>{['All',...new Set(db.history.map(h=>h.result))].map(s=><option key={s}>{s}</option>)}</select></Toolbar>
      {rows.map(h=><ListItem key={h.id} title={h.source} subtitle={h.time} badge={h.result}><p className="work-item-copy">{h.detail}</p></ListItem>)}
      {!rows.length&&<EmptyState title="No activity matches" text="Try another search or status filter."/>}
    </Panel>;
  }
  function ResultsReview({db,setDb,notify}) {
    return <><Panel title="Results awaiting review" icon="trendingup">{db.results.length?db.results.map(r=><ListItem key={r.id} title={r.event} subtitle={r.time+' · '+r.entries.length+' entries'} badge={r.status}
      actions={r.status==='Pending'&&<><button className="button-primary" onClick={()=>{setDb(d=>({...d,results:d.results.map(x=>x.id===r.id?{...x,status:'Approved'}:x)}));notify('Results approved in this preview. Public ranking points are unchanged.');}}>Approve result preview</button><button className="button-secondary" onClick={()=>{setDb(d=>({...d,results:d.results.map(x=>x.id===r.id?{...x,status:'Changes requested'}:x)}));notify('Result review updated.');}}>Request changes</button></>}>
        <div className="results-entries">{r.entries.slice().sort((a,b)=>b.score-a.score).map((e,i)=><div key={e.name}><strong>#{i+1} {e.name}</strong><span>{e.score} / 100</span></div>)}</div>
      </ListItem>):<EmptyState title="No submitted results yet" text="Use the organizer Results tab to score sample entries and send them here."/>}<Link className="inline-link" to={route('organizer','results')}>Open organizer results →</Link></Panel>
      <Panel title="Clear rules. Credible rankings." icon="shieldcheck"><p>Verify organizer results and publish a consistent scoring policy before changing public standings. This preview keeps the existing sample leaderboard intact.</p><Link className="inline-link" to="/rankings">View the sample leaderboard →</Link></Panel></>;
  }
  function Fairs({db,setDb,notify}) {
    const [editor,setEditor]=useState(null);
    return <><Panel title="Career events directory" icon="briefcase">{db.fairs.map(f=><ListItem key={f.id} title={f.title} subtitle={f.date} badge={f.status}
      actions={<><Link className="work-text-button" to={'/job-fairs/'+f.id}>View sample event →</Link><button className="work-text-button" onClick={()=>setEditor(f)}>Edit listing preview</button>
        <button className="button-secondary" onClick={()=>{setDb(d=>({...d,fairs:d.fairs.map(x=>x.id===f.id?{...x,status:x.status==='Listed'?'Paused':'Listed'}:x)}));notify('Directory status updated locally. Public sample pages are unchanged.');}}>{f.status==='Listed'?'Pause preview':'Restore preview'}</button></>}/>)}</Panel>
      {editor&&<DemoForm key={editor.id} title="Career event details" initial={editor} fields={[{name:'title',label:'Event title'},{name:'date',label:'Event dates',hint:'For example: November 12–13, 2026'}]} onSave={v=>{setDb(d=>({...d,fairs:d.fairs.map(f=>f.id===editor.id?{...f,...v}:f)}));setEditor(null);notify('Fair listing preview saved.');}}><button className="work-text-button" type="button" onClick={()=>setEditor(null)}>Cancel</button></DemoForm>}</>;
  }
  function UniversityReviewDetails({candidate,busy,onSave}) {
    const payload={...candidate.payload,...candidate.review_overrides};
    const localDate=value=>{
      if(!value)return '';
      const date=new Date(value);
      return Number.isNaN(date.getTime())?'':new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
    };
    const [draft,setDraft]=useState(()=>Object.fromEntries(['title','description','competition_category','event_start_date','event_end_date','registration_deadline','organizer_name','host_organization','host_type','university_name','event_mode','location','registration_url','eligibility'].map(name=>[name,name.endsWith('_date')||name==='registration_deadline'?localDate(payload[name]):payload[name]||''])));
    const [error,setError]=useState('');
    const field=(name,label,options)=> <label className="work-label" key={name}>{label}{options?
      <select className="form-input" aria-label={label} value={draft[name]} disabled={busy} onChange={event=>setDraft(d=>({...d,[name]:event.target.value}))}><option value="">Not confirmed</option>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select>:
      name==='description'?<textarea className="form-input" aria-label={label} value={draft[name]} maxLength={5000} disabled={busy} onChange={event=>setDraft(d=>({...d,[name]:event.target.value}))}/>:<input className="form-input" aria-label={label} type={name.endsWith('_date')||name==='registration_deadline'?'datetime-local':name==='registration_url'?'url':'text'} value={draft[name]} maxLength={name==='registration_url'?500:name==='description'?5000:name==='title'?180:200} disabled={busy} onChange={event=>setDraft(d=>({...d,[name]:event.target.value}))}/>}</label>;
    async function submit(event){
      event.preventDefault();setError('');const details={...draft};
      for(const name of ['event_start_date','event_end_date','registration_deadline']){
        if(!details[name])details[name]=null;
        else if(Number.isNaN(new Date(details[name]).getTime())){setError('Enter a valid date and time.');return;}
        else details[name]=new Date(details[name]).toISOString();
      }
      await onSave(details);
    }
    return <details className="live-change-summary university-review-details"><summary>Confirm announcement details</summary>
      <p className="work-item-copy">Publisher: {candidate.payload?.university_publisher||candidate.source_name}. This does not establish the host. Read the original announcement and add a review note explaining your evidence.</p>
      <p className="small-note">Times below use your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}. The announcement publication date is not the event date.</p>
      <form onSubmit={submit} className="page-form">
        <div className="form-grid">{field('title','Confirmed title')}{field('description','Confirmed description')}{field('competition_category','Competition category',DATA.categories.filter(c=>c.id!=='all').map(c=>[c.id,c.name]))}{field('event_start_date','Confirmed event start')}{field('event_end_date','Confirmed event end (optional)')}{field('registration_deadline','Confirmed registration deadline (optional)')}{field('organizer_name','Confirmed organizer')}{field('host_organization','Confirmed host organization')}{field('host_type','Confirmed host type',[['university','University-hosted'],['outside_university','Outside university']])}{field('university_name','Hosting university name')}{field('event_mode','Confirmed event format',[['online','Online'],['in_person','On-site'],['hybrid','Hybrid']])}{field('location','Confirmed location')}{field('registration_url','Confirmed registration link')}</div>
        <label className="work-label">Confirmed eligibility (optional)<textarea className="form-input" aria-label="Confirmed eligibility (optional)" rows={2} maxLength={5000} value={draft.eligibility} disabled={busy} onChange={event=>setDraft(d=>({...d,eligibility:event.target.value}))}/></label>
        {error&&<Notice error>{error}</Notice>}
        <button className="button-secondary" type="submit" disabled={busy}>Save verified details</button>
      </form></details>;
  }
  function FacebookConnections({revision,onChanged}) {
    const [state,setState]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
    useEffect(()=>{let active=true;requestApi('/discovery/facebook/').then(data=>{if(active)setState(data);}).catch(()=>{if(active)setError('Facebook connection settings could not be loaded.');});return()=>{active=false;};},[revision]);
    async function action(path,method,body={}){setBusy(true);setError('');try{const result=await requestApi(path,{method,body});if(result.url){window.location.assign(result.url);return;}onChanged();}catch(e){setError(typeof e.data?.detail==='string'?e.data.detail:Array.isArray(e.data)?e.data.join(' '):e.message);}finally{setBusy(false);}}
    return <Panel title="Facebook Pages" icon="layoutgrid">
      <p className="work-item-copy">Connect Pages you are authorized to manage. New connections start paused. Enable a Page here, then enable the Facebook source below to collect its competition posts.</p>
      {error&&<Notice error>{error}</Notice>}
      {!state?<p>Loading Facebook connection status…</p>:<>
        {!state.configured&&<Notice>{state.setup_message}</Notice>}
        <button className="button-primary" disabled={busy||!state.configured} onClick={()=>action('/discovery/facebook/connect/','POST')}>Connect Facebook Pages ↗</button>
        {!state.pages.length&&<p className="small-note">No Facebook Pages connected yet. Organizers can still suggest individual post links through Submit Competition.</p>}
        {state.pages.map(page=><ListItem key={page.id} title={page.name} subtitle={'Page ID: '+page.page_id} badge={page.enabled?'Enabled':'Paused'}>
          {page.last_error&&<Notice error>{page.last_error}</Notice>}
          <div className="work-item-actions"><button className="button-secondary" disabled={busy||(!state.configured&&!page.enabled)} onClick={()=>action('/discovery/facebook/pages/'+page.id+'/','PATCH',{enabled:!page.enabled})}>{page.enabled?'Pause Page':'Enable Page'}</button><button className="work-text-button" disabled={busy} onClick={()=>action('/discovery/facebook/pages/'+page.id+'/','DELETE')}>Disconnect Page</button></div>
        </ListItem>)}
        <p className="small-note">Only authorized Page posts are collected. Groups, personal profiles and image-only competition details are not automatically read. Every Facebook announcement needs staff verification.</p>
      </>}
    </Panel>;
  }

  function LiveImports() {
    const [section,setSection]=useState('sources'),[filter,setFilter]=useState('pending'),[revision,setRevision]=useState(0);
    const [reviewSource,setReviewSource]=useState('all');
    const [state,setState]=useState({status:'loading',sources:[],candidates:[],runs:[],error:''});
    const [busy,setBusy]=useState(''),[feedback,setFeedback]=useState(null),[notes,setNotes]=useState({});
    const backendOrigin='http://'+(window.location.hostname==='localhost'?'localhost':'127.0.0.1')+':8001';
    const djangoAdminUrl=backendOrigin+'/admin/';
    const asRows=value=>Array.isArray(value)?value:Array.isArray(value?.results)?value.results:[];
    const date=value=>{
      if(!value)return 'Not checked yet';
      const parsed=new Date(value);
      return Number.isNaN(parsed.getTime())?'Not provided':parsed.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
    };
    const valueText=value=>value===null||value===undefined||value===''?'Not provided':Array.isArray(value)?value.join(', '):typeof value==='object'?JSON.stringify(value):String(value);
    const fieldLabels={title:'Title',description:'Description',event_start_date:'Start date',event_end_date:'End date',registration_deadline:'Registration deadline',eligibility:'Eligibility',team_size:'Team size',prize_pool:'Prizes',registration_url:'Registration link',source_url:'Original announcement',location:'Location',organizer_name:'Organizer'};
    function safeLink(value) {
      try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}
    }
    function errorText(error) {
      if(Array.isArray(error.data))return error.data.map(valueText).join(' · ');
      const fields=Object.entries(error.data||{}).filter(([key])=>!['detail','run'].includes(key)).map(([key,value])=>(fieldLabels[key]||key.replace(/_/g,' '))+': '+valueText(value));
      return fields.length?fields.join(' · '):error.message||'The import service could not complete this request.';
    }
    useEffect(()=>{
      let active=true;
      setState(s=>({...s,status:'loading',error:''}));
      const queryParts=new URLSearchParams();
      if(filter!=='all')queryParts.set('status',filter);
      if(reviewSource!=='all')queryParts.set('source',reviewSource);
      const query=queryParts.size?'?'+queryParts.toString():'';
      Promise.all([requestApi('/discovery/sources/'),requestApi('/discovery/candidates/'+query),requestApi('/discovery/runs/')]).then(([sources,candidates,runs])=>{
        if(active)setState({status:'ready',sources:asRows(sources),candidates:asRows(candidates),runs:asRows(runs),error:''});
      }).catch(error=>{
        if(active)setState(s=>({...s,status:error.status===401||error.status===403?'forbidden':'error',error:errorText(error)}));
      });
      return()=>{active=false;};
    },[filter,reviewSource,revision]);
    async function mutate(key,path,body,success) {
      if(busy)return;
      setBusy(key);setFeedback(null);
      try{
        await requestApi(path,{method:path.endsWith('/run/')?'POST':'PATCH',body});
        setFeedback({error:false,text:success});setRevision(r=>r+1);
      }catch(error){
        setFeedback({error:true,text:errorText(error)});
        // Failed remote checks are also recorded by Django and belong in history.
        if(error.data?.run)setRevision(r=>r+1);
      }finally{setBusy('');}
    }
    function review(candidate,action) {
      const review_notes=(notes[candidate.id]??candidate.review_notes??'').trim();
      if(action==='reject'&&!review_notes){setFeedback({error:true,text:'Add a review note before rejecting this imported competition.'});return;}
      if(candidate.requires_verification&&!review_notes){setFeedback({error:true,text:'Add a review note explaining how you verified the announcement details.'});return;}
      const success=action==='approve'?'Competition approved. It is now available in the public directory.':action==='apply_update'?'Source updates applied to the competition.':'Imported competition rejected.';
      mutate('candidate-'+candidate.id,'/discovery/candidates/'+candidate.id+'/',{action,review_notes},success);
    }
    if(state.status==='forbidden')return <Panel title="Staff access is required" icon="shieldcheck">
      <Notice error>The live importer requires a signed-in staff account with import permissions. Preview roles do not grant access.</Notice>
      <p className="live-import-intro">Sign in with an existing authorized account, then return here. These controls use the backend database; this page does not create or elevate accounts.</p>
      <div className="work-item-actions"><Link className="button-primary" to="/login">Go to login</Link><a className="button-secondary" href={djangoAdminUrl} target="_blank" rel="noopener noreferrer">Django Admin ↗</a><button className="work-text-button" onClick={()=>setRevision(r=>r+1)}>Check access again</button></div>
    </Panel>;
    if(state.status==='error')return <Panel title="Import service unavailable" icon="info"><Notice error>{state.error}</Notice><p className="live-import-intro">Start the Django backend on port 8001 and check its configuration.</p><button className="button-secondary" onClick={()=>setRevision(r=>r+1)}>Try again</button></Panel>;
    return <>
      <div className="live-import-heading"><div><span className="live-service-badge"><span/>LIVE DATABASE CONTROLS</span><p>Official sources include Codeforces, AtCoder, MLH and Bangladesh universities listed below, including BUET, RUET, Dhaka University, Khulna University and GSTU Gopalganj. University announcements always require staff verification. Facebook requires an authorized connection.</p></div>
        <button className="button-secondary" disabled={!!busy||state.status==='loading'} onClick={()=>setRevision(r=>r+1)}>Refresh</button>
      </div>
      {feedback&&<div className="workspace-feedback"><Notice error={feedback.error}>{feedback.text}</Notice><button aria-label="Dismiss import update" onClick={()=>setFeedback(null)}>×</button></div>}
      <div className="page-tabs live-import-tabs" role="group" aria-label="Live import sections">{[['sources','Sources'],['review','Review queue'],['history','Run history']].map(([id,label])=><button key={id} aria-pressed={section===id} className={section===id?'active':''} onClick={()=>setSection(id)}>{label}{id==='review'&&state.status==='ready'&&<span>{state.candidates.length}</span>}</button>)}</div>
      {state.status==='loading'&&<div className="live-import-loading" role="status"><Icon name="clock" className="w-5 h-5"/>Loading current source, review, and run records…</div>}
      {state.status==='ready'&&section==='sources'&&<>
        <p className="live-import-intro">Enabled sources are eligible for collection. Automatic checks require a running background worker; this page does not start or monitor that process. Check attempt times, results and errors below to assess collection evidence.</p>
        <FacebookConnections revision={revision} onChanged={()=>setRevision(r=>r+1)}/>
        <Panel title="Your active discovery network" icon="layoutgrid">
          {!state.sources.length&&<EmptyState title="No sources configured yet" text="Run the Django discovery bootstrap command or add supported source records in Django Admin."/>}
          {state.sources.map(source=>{
            const supported=source.can_run===true;
            return <ListItem key={source.id} title={source.name} subtitle={source.university_publisher||({'codeforces':'Official Codeforces contest API','atcoder':'Official AtCoder upcoming and daily contest schedule','mlh':'Official MLH student hackathon season schedule','facebook':'Facebook · authorization required'})[source.connector]||source.connector} badge={!supported?'Unavailable':source.enabled?'Enabled':'Paused'}>
              {!!source.source_urls?.length&&<div className="university-source-links">{source.source_urls.map((url,index)=><a className="inline-link" key={url} href={safeLink(url)} target="_blank" rel="noopener noreferrer">Official university source{source.source_urls.length>1?' '+(index+1):''} ↗</a>)}</div>}
              <div className="live-source-details"><div><span>Last checked</span><strong>{date(source.last_checked_at)}</strong></div><div><span>Publication</span><strong>{source.auto_publish?'New listings publish automatically':'New listings wait for review'}</strong></div></div>
              <dl className="import-facts source-health" aria-label={'Source health for '+source.name}>{[
                ['Health',source.health?.label||'Not checked'],['Last attempted',date(source.health?.last_attempt_at)],
                ['Last successful',date(source.health?.last_success_at)],['Last failed',date(source.health?.last_failure_at)],
                ['Next eligible check',date(source.health?.next_eligible_at)],['Consecutive failures',source.health?.consecutive_failures??0],
                ['Pending review',source.health?.pending_count??0],['Approved',source.health?.approved_count??0],
                ['Rejected',source.health?.rejected_count??0],['Total runs',source.health?.total_run_count??0],
                ['Total candidates',source.health?.candidate_count??0],['Possible duplicates',source.health?.possible_duplicate_count??0],
                ['Last successful new',source.health?.last_success_created_count??'No success'],['Last successful updated',source.health?.last_success_updated_count??'No success'],
                ['Last successful unchanged',source.health?.last_success_unchanged_count??'No success'],['Collection evidence',source.health?.collection_evidence||'No completed collection evidence recorded.'],
                ['Last result',source.health?.last_run_result||'No runs'],['Retry state',source.health?.retry_scheduled?'Waiting for cooldown':'No cooldown']
              ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              {source.last_error&&<div className="import-warning duplicate"><Icon name="info" className="w-4 h-4"/>{source.last_error}</div>}
              {!supported&&<p className="work-item-copy">This source cannot be collected yet. A public Page link alone does not authorize automated Facebook access. No login cookies, passwords, or access tokens should be entered here.</p>}
              <div className="live-source-controls">
                <label>Check interval<select aria-label={'Check interval for '+source.name} className="form-input" value={source.interval_minutes} disabled={!!busy||!supported} onChange={e=>mutate('source-'+source.id,'/discovery/sources/'+source.id+'/',{interval_minutes:Number(e.target.value)},'Source interval saved. The background collector uses this schedule.')}>
                  {[15,30,60,180,360,720,1440].map(minutes=><option key={minutes} value={minutes}>{minutes<60?minutes+' minutes':minutes===60?'Every hour':minutes===1440?'Daily':'Every '+minutes/60+' hours'}</option>)}
                  {![15,30,60,180,360,720,1440].includes(source.interval_minutes)&&<option value={source.interval_minutes}>{source.interval_minutes} minutes</option>}
                </select></label>
                <label className="live-auto-publish"><input type="checkbox" checked={!!source.auto_publish} disabled={!!busy||!supported||source.review_required} onChange={e=>mutate('source-'+source.id,'/discovery/sources/'+source.id+'/',{auto_publish:e.target.checked},'Publication preference saved for future imports. Existing review decisions are unchanged.')}/><span>{source.review_required?'Staff verification is required for these announcements':'Automatically publish new listings from this source'}</span></label>
              </div>
              <div className="work-item-actions"><button className="button-secondary" disabled={!!busy||!supported} onClick={()=>mutate('source-'+source.id,'/discovery/sources/'+source.id+'/',{enabled:!source.enabled},source.enabled?'Source paused.':'Source enabled.')}>{source.enabled?'Pause source':'Enable source'}</button>
                <button className="button-primary" disabled={!!busy||!supported||!source.enabled||source.health?.retry_scheduled} onClick={()=>mutate('run-'+source.id,'/discovery/sources/'+source.id+'/run/',{},'Collection run recorded. Review its results in Run history.')}>{busy==='run-'+source.id?'Checking source…':'Run now'}</button>
              </div>
            </ListItem>;
          })}
        </Panel>
        <Panel title="Automatic discovery, accountable publication" icon="shieldcheck"><p>Collection intervals are used by the background worker. Keep new sources in manual review until you trust their data. Missing deadlines, eligibility, prizes, and fees stay unknown; an imported listing is not automatically a verified event.</p><a className="inline-link" href={djangoAdminUrl} target="_blank" rel="noopener noreferrer">Manage source records in Django Admin ↗</a></Panel>
      </>}
      {state.status==='ready'&&section==='review'&&<Panel title="Imported competitions" icon="eye">
        <div className="work-panel-actions"><span>{state.candidates.length} candidates in this view</span><select className="form-input" aria-label="Review source" value={reviewSource} disabled={!!busy} onChange={e=>setReviewSource(e.target.value)}><option value="all">All sources</option>{state.sources.map(source=><option key={source.id} value={source.id}>{source.name}</option>)}</select><select className="form-input" aria-label="Live import review status" value={filter} disabled={!!busy} onChange={e=>setFilter(e.target.value)}>{[['pending','New imports'],['update_pending','Source updates'],['approved','Approved'],['rejected','Rejected'],['all','All statuses']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
        {!state.candidates.length&&<EmptyState title="This review queue is clear" text="Run an enabled source, or choose another review status."/>}
        {state.candidates.map(candidate=>{
          const payload={...candidate.payload,...candidate.review_overrides},changes=Object.entries(candidate.changes||{}),sourceUrl=safeLink(payload.source_url||payload.registration_url),isUpdate=candidate.status==='update_pending';
          return <ListItem key={candidate.id} title={candidate.title||payload.title||'Untitled imported competition'} subtitle={candidate.source_name+' · '+(payload.organizer_name||payload.host_organization||'Organizer not provided')} badge={candidate.status.replace(/_/g,' ')}>
            <p className="work-item-copy">{payload.description||'Description not provided by the source.'}</p>
            <dl className="import-facts"><div><dt>Start time</dt><dd>{payload.event_start_date?date(payload.event_start_date):'Unknown — staff must confirm a date and time'}</dd></div><div><dt>Registration deadline</dt><dd>{payload.registration_deadline?date(payload.registration_deadline):'Unknown — check the source'}</dd></div><div><dt>Original announcement</dt><dd>{sourceUrl?<a href={sourceUrl} target="_blank" rel="noopener noreferrer">Open source ↗</a>:'Not provided'}</dd></div></dl>
            {candidate.is_university_source&&<>
              <p className="small-note">University publisher: {payload.university_publisher||'Unknown'}. Publishing an announcement does not establish the organizer or host.</p>
              <p className="small-note">Organizer: {payload.organizer_name||'Unknown'} · Host: {payload.host_organization||'Unknown'} · Format: {payload.event_mode||'Unknown'} · Date precision: {payload.date_precision||'Unknown'}</p>
              {!!candidate.source_urls?.length&&<p className="small-note">Collection listing: {candidate.source_urls.map(url=><a className="inline-link" key={url} href={safeLink(url)} target="_blank" rel="noopener noreferrer">{url} </a>)}</p>}
              {payload.source_evidence?.dates&&Object.entries(payload.source_evidence.dates).map(([label,evidence])=><p className="import-warning" key={label}>Source date evidence ({label.replace(/_/g,' ')}): {evidence.raw||'Unknown'} · {evidence.precision||'unresolved'}{evidence.reason?' · '+evidence.reason:''}. Date-only evidence is not an approved event time.</p>)}
              {payload.source_evidence?.attachment_review&&<p className="import-warning">{payload.source_evidence.attachment_review}</p>}
              {!!payload.source_evidence?.conflicting_labels?.length&&<p className="import-warning">Conflicting source labels: {payload.source_evidence.conflicting_labels.join(', ')}. Resolve these against the original announcement.</p>}
              {!!payload.source_evidence?.labelled_fields?.length&&<details className="live-change-summary"><summary>Source-stated field evidence — not independent verification</summary><ul>{payload.source_evidence.labelled_fields.map((evidence,index)=><li key={index}>{evidence.field.replace(/_/g,' ')}: {evidence.text}</li>)}</ul></details>}
            </>}
            <p className="small-note">Last seen at source: {date(candidate.last_seen_at)} ? Classification: {(candidate.payload.announcement_classification||'Source schedule').replace(/_/g,' ')}</p>
            <p className="small-note">Missing metadata: {(candidate.missing_metadata||[]).join(', ')||'None in the checked fields'}</p>
            {candidate.freshness?.map(label=><p className="import-warning" key={label}>{label}</p>)}
            <details className="live-change-summary"><summary>Source data, last applied version and staff overrides</summary>
              <h4>Current source data</h4><pre>{JSON.stringify(candidate.payload,null,2)}</pre>
              <h4>Last applied version</h4><pre>{JSON.stringify(candidate.applied_payload,null,2)}</pre>
              <h4>Staff-confirmed overrides</h4><pre>{JSON.stringify(candidate.review_overrides,null,2)}</pre>
            </details>
            {!!candidate.review_history?.length&&<details className="live-change-summary"><summary>Review decision history ({candidate.review_history.length})</summary><ol>{candidate.review_history.map((entry,index)=><li key={index}>{date(entry.at)} · {entry.action.replace(/_/g,' ')} · Staff #{entry.staff_id??'unknown'}<p>{entry.note||'No note recorded'}</p>{entry.fields?.length>0&&<p>Fields: {entry.fields.join(', ')}</p>}</li>)}</ol></details>}
            {Array.isArray(candidate.warnings)&&candidate.warnings.map((warning,i)=><div className="import-warning duplicate" key={i}><Icon name="info" className="w-4 h-4"/>{valueText(warning)}</div>)}
            {isUpdate&&changes.length>0&&<details className="live-change-summary"><summary>{changes.length} source changes to review</summary><dl>{changes.map(([field,change])=><div key={field}><dt>{fieldLabels[field]||field.replace(/_/g,' ')}</dt><dd>{change&&typeof change==='object'&&!Array.isArray(change)?<><span>Before: {valueText(change.old??change.before)}</span><strong>Source: {valueText(change.new??change.after)}</strong></>:<strong>{valueText(change)}</strong>}</dd></div>)}</dl></details>}
            {(candidate.status==='pending'||isUpdate)&&<><label className="work-label live-review-note">Review note<textarea className="form-input" aria-label={'Review note for '+(candidate.title||payload.title||candidate.id)} rows={2} maxLength={2000} value={notes[candidate.id]??candidate.review_notes??''} onChange={e=>setNotes(n=>({...n,[candidate.id]:e.target.value}))} placeholder="Explain a rejection or add context for this decision."/></label>
              {candidate.requires_verification&&<UniversityReviewDetails key={candidate.id+JSON.stringify(candidate.review_overrides)} candidate={candidate} busy={!!busy} onSave={details=>mutate('details-'+candidate.id,'/discovery/candidates/'+candidate.id+'/',{action:'save_details',verified_details:details,review_notes:(notes[candidate.id]??candidate.review_notes??'').trim()},'Verified details saved. Check them before approving publication.')}/>}
              <div className="work-item-actions"><button className="button-primary" disabled={!!busy} onClick={()=>review(candidate,isUpdate?'apply_update':'approve')}>{busy==='candidate-'+candidate.id?'Saving…':isUpdate?'Apply reviewed update':'Approve & publish'}</button><button className="button-secondary" disabled={!!busy} onClick={()=>review(candidate,'reject')}>Reject import</button></div></>}
            {candidate.competition&&<Link className="inline-link" to={'/competitions/'+candidate.competition}>Open linked competition →</Link>}
          </ListItem>;
        })}
      </Panel>}
      {state.status==='ready'&&section==='history'&&<Panel title="Collection run history" icon="clock">
        {!state.runs.length&&<EmptyState title="No collection runs yet" text="Use Run now on an enabled source, or start the scheduled collector."/>}
        {state.runs.map(run=><ListItem key={run.id} title={run.source_name} subtitle={date(run.started_at)} badge={run.status}>
          <div className="live-run-counts"><span><strong>{run.created_count||0}</strong> new</span><span><strong>{run.updated_count||0}</strong> updated</span><span><strong>{run.skipped_count||0}</strong> skipped</span><span>{run.finished_at?'Finished '+date(run.finished_at):'Run in progress'}</span></div>
          {run.error&&<div className="import-warning duplicate"><Icon name="info" className="w-4 h-4"/>{run.error}</div>}
        </ListItem>)}
      </Panel>}
    </>;
  }
  function AdminPage({search}) {
    const params=new URLSearchParams(search),tab=adminMenu.some(([id])=>id===params.get('tab'))?params.get('tab'):'overview';
    const [db,setDb,error]=useDemoStore(),[feedback,setFeedback]=useState(null);
    useEffect(()=>setFeedback(null),[tab]);
    const notify=(text,error=false)=>setFeedback({text,error}),props={db,setDb,notify};
    const content={overview:()=> <AdminOverview db={db}/>,approvals:()=> <ApprovalQueue {...props}/>,users:()=> <People {...props}/>,sources:()=> <Sources {...props}/>,
      imports:()=> <Imports {...props}/>,history:()=> <ImportHistory db={db}/>,rankings:()=> <ResultsReview {...props}/>,fairs:()=> <window.TalentSquareJobFairUI.Review/>};
    const djangoAdminUrl='http://'+(window.location.hostname==='localhost'?'localhost':'127.0.0.1')+':8001/admin/';
    return <Shell admin live={['live-imports','fairs'].includes(tab)} tab={tab} menu={adminMenu} heading={tab==='fairs'?'Job fair review':tab==='live-imports'?'Live competition imports':'Preview only · '+(tab==='overview'?'A thriving sphere starts here.':adminMenu.find(([id])=>id===tab)[1])}>
      {!['live-imports','fairs'].includes(tab)&&<Notice error>These admin sections use sample data. Use Live imports for the real collector and import review, or Django Admin for organizer submissions. <Link className="inline-link" to={adminRoute('live-imports')}>Open Live imports →</Link><a className="inline-link" href={djangoAdminUrl} target="_blank" rel="noopener noreferrer">Open Django Admin ↗</a></Notice>}
      {error&&<Notice error>{error}</Notice>}{feedback&&<div className="workspace-feedback"><Notice error={feedback.error}>{feedback.text}</Notice><button aria-label="Dismiss update" onClick={()=>setFeedback(null)}>×</button></div>}
      <div key={tab}>{tab==='live-imports'?<LiveImports/>:content[tab]()}</div>
    </Shell>;
  }
  return { WorkspacePage, AdminPage };
};

/* Real Job Fair UI shares the existing session/CSRF helper and visual components. */
window.createTalentSquareJobFairs = function ({Link,Panel,Notice,requestApi}) {
  const {useState,useEffect}=React;
  const date=value=>value?new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}):'Not provided';
  const errorText=e=>typeof e.data?.detail==='string'?e.data.detail:e.data?JSON.stringify(e.data):e.message;
  const safe=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}};
  function useData(path,revision=0){
    const [state,set]=useState({loading:true,data:null,error:null});
    useEffect(()=>{let active=true;if(!path){set({loading:false,data:null,error:null});return;}
      set({loading:true,data:null,error:null});requestApi(path).then(data=>{if(active)set({loading:false,data,error:null});}).catch(error=>{if(active)set({loading:false,data:null,error});});return()=>{active=false;};
    },[path,revision]);return state;
  }
  function Status({state}){return state.loading?<p role="status">Loading job fairs…</p>:state.error?<Notice error>{[401,403].includes(state.error.status)?'A signed-in account with the required role or job fair review permissions is needed.':errorText(state.error)} <Link to="/login">Go to login</Link></Notice>:null;}
  function Pager({data,page,onPage}){return <div className="work-item-actions"><button className="button-secondary" disabled={!data?.previous} onClick={()=>onPage(page-1)}>Previous fairs</button><span>Page {page} · {data?.count??0} records</span><button className="button-secondary" disabled={!data?.next} onClick={()=>onPage(page+1)}>Next fairs</button></div>;}
  function Card({fair}){return <article className="glass-card rounded-2xl p-6 border border-slate-800"><p className="eyebrow">{fair.event_format} · {fair.attendance_mode==='internal'?'Talent Square registration':'External registration'}</p><h3 className="font-heading font-bold text-xl text-white">{fair.title}</h3><p>{fair.organizer_name}</p><p>{date(fair.start_at)}</p><p>{fair.venue}{fair.city?' · '+fair.city:''}</p><p className="small-note">{fair.registration_open?'Registration open':'Registration closed'}</p><Link className="button-primary" to={'/job-fairs/'+fair.id}>View fair details</Link></article>;}
  function Directory({home=false}){
    const [query,setQuery]=useState(''),[city,setCity]=useState(''),[format,setFormat]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[ordering,setOrdering]=useState('start_at'),[page,setPage]=useState(1),[retry,setRetry]=useState(0);
    const params=new URLSearchParams({page:String(page),page_size:home?'3':'12',ordering,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Dhaka'});
    if(query)params.set('search',query);if(city)params.set('city',city);if(format)params.set('event_format',format);if(from)params.set('date_from',from);if(to)params.set('date_to',to);
    const state=useData('/job-fairs/?'+params,retry),change=setter=>event=>{setter(event.target.value);setPage(1);};
    return <section id="jobfairs" className="py-20 bg-[#060911] border-t border-slate-800/80"><div className="page-container"><h2 className="font-heading font-black text-3xl text-white">Job fairs</h2><p>Meet organizers at published career events. Attendance registration is not a job application or verified attendance.</p>
      {!home&&<div className="listing-toolbar"><input className="form-input" aria-label="Search job fairs" placeholder="Search job fairs" value={query} onChange={change(setQuery)}/><input className="form-input" aria-label="Job fair city" placeholder="City" value={city} onChange={change(setCity)}/><select className="form-input" aria-label="Fair format" value={format} onChange={change(setFormat)}><option value="">All formats</option><option value="onsite">On-site</option><option value="online">Online</option><option value="hybrid">Hybrid</option></select><input aria-label="Fairs from date" type="date" value={from} onChange={change(setFrom)}/><input aria-label="Fairs to date" type="date" value={to} onChange={change(setTo)}/><select aria-label="Sort job fairs" className="form-input" value={ordering} onChange={change(setOrdering)}><option value="start_at">Event date</option><option value="-published_at">Recently published</option><option value="title">Title</option><option value="-start_at">Latest event date</option></select></div>}
      <Status state={state}/>{state.error&&<button className="button-secondary" onClick={()=>setRetry(r=>r+1)}>Retry job fairs</button>}
      {state.data&&<><div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{state.data.results.map(fair=><Card key={fair.id} fair={fair}/>)}</div>{!state.data.results.length&&<p>No published job fairs found.</p>}{home?<Link className="inline-link" to="/job-fairs">Browse all job fairs →</Link>:<Pager data={state.data} page={page} onPage={setPage}/>}</>}
    </div></section>;
  }
  function Detail({id}){
    const [revision,setRevision]=useState(0),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
    const fair=useData('/job-fairs/'+encodeURIComponent(id)+'/'),account=useData('/auth/me/');
    const participant=account.data?.role==='participant';const activity=useData(participant?'/participant/job-fairs/'+encodeURIComponent(id)+'/activity/':null,revision);
    async function act(path,method,success){if(busy)return;setBusy(true);setMessage('');try{await requestApi(path,{method,body:{}});setMessage(success);setRevision(r=>r+1);}catch(e){setMessage(errorText(e));}finally{setBusy(false);}}
    if(fair.loading)return <div className="page-container"><Status state={fair}/></div>;
    if(fair.error)return <div className="page-container"><h1>{fair.error.status===404?'Job fair not found':'Job fair unavailable'}</h1><Status state={fair}/></div>;
    const f=fair.data,r=activity.data?.registration;
    return <div className="page-container py-20"><Link className="inline-link" to="/job-fairs">All job fairs</Link><h1 className="font-heading font-black text-4xl text-white">{f.title}</h1><p>{f.organizer_name}</p><div className="detail-layout"><div className="detail-main"><Panel title="About this job fair"><p style={{whiteSpace:'pre-wrap'}}>{f.description}</p><p>Eligibility: {f.eligibility}</p><p>{f.university}</p>{safe(f.official_website_url)&&<a className="inline-link" href={safe(f.official_website_url)} target="_blank" rel="noopener noreferrer">Official event website ↗</a>}</Panel><Panel title="Event details"><p>Starts: {date(f.start_at)}</p><p>Ends: {date(f.end_at)}</p><p>Venue: {f.venue} · {f.city} · {f.event_format}</p><p>Registration deadline: {date(f.registration_deadline)}</p></Panel></div><aside className="detail-sidebar"><Panel title="Attendance registration"><p>Mode: {f.attendance_mode}</p><p>{f.registration_open?'Registration open':'Registration closed'}</p><p className="small-note">This records interest or planned attendance. It is not verified attendance, recruitment or a job application.</p>
      {f.attendance_mode==='external'&&safe(f.external_registration_url)&&<><a data-job-fair-external className="button-primary" href={safe(f.external_registration_url)} target="_blank" rel="noopener noreferrer">Official external registration ↗</a><p className="small-note">Opening this link does not register you on Talent Square or confirm external registration.</p></>}
      {!participant?<p><Link to="/login">Sign in as a Participant</Link> to save a fair or register internally.</p>:<><Status state={activity}/>{activity.data&&<><button className="button-secondary" disabled={busy} onClick={()=>act('/participant/job-fairs/'+f.id+'/bookmark/',activity.data.bookmarked?'DELETE':'POST',activity.data.bookmarked?'Job fair removed from saved items.':'Job fair saved.')}>{activity.data.bookmarked?'Unsave job fair':'Save job fair'}</button>
      {f.attendance_mode==='internal'&&(r?<><p>{r.status==='active'?'Registered on Talent Square':'Registration withdrawn'}</p>{r.status==='active'&&new Date(f.start_at)>new Date()&&<button className="button-secondary" disabled={busy} onClick={()=>{if(window.confirm('Withdraw your job fair registration? History will be retained.'))act('/participant/job-fair-registrations/'+r.id+'/withdraw/','POST','Job fair registration withdrawn. History retained.');}}>Withdraw job fair registration</button>}</>:<button className="button-primary" disabled={busy||!f.registration_open} onClick={()=>act('/participant/job-fairs/'+f.id+'/register/','POST','Registered on Talent Square. This is not verified attendance.')}>Register attendance</button>)}</>}</>}
      {message&&<p role="status">{message}</p>}</Panel></aside></div></div>;
  }
  function Participant(){
    const [revision,setRevision]=useState(0),[bp,setBp]=useState(1),[rp,setRp]=useState(1),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
    const saved=useData('/participant/job-fair-bookmarks/?page='+bp,revision),registrations=useData('/participant/job-fair-registrations/?page='+rp,revision);
    async function action(path,method){setBusy(true);try{await requestApi(path,{method,body:{}});setMessage('Job fair activity updated; registration history retained.');setRevision(r=>r+1);}catch(e){setMessage(errorText(e));}finally{setBusy(false);}}
    return <><p>Job fair attendance is separate from competition activity and job applications.</p>{message&&<Notice>{message}</Notice>}<Panel title="Saved job fairs"><Status state={saved}/>{saved.data&&<>{saved.data.results.map(row=><article className="work-list-item" key={row.id}><Card fair={row.job_fair}/><button className="button-secondary" disabled={busy} onClick={()=>action('/participant/job-fairs/'+row.job_fair.id+'/bookmark/','DELETE')}>Remove saved fair</button></article>)}{!saved.data.results.length&&<p>No saved job fairs.</p>}<Pager data={saved.data} page={bp} onPage={setBp}/></>}</Panel><Panel title="My job fair registrations"><Status state={registrations}/>{registrations.data&&<>{registrations.data.results.map(row=><article className="work-list-item" key={row.id}><h3>{row.job_fair.title}</h3><p>{date(row.job_fair.start_at)} · {row.job_fair.venue} · {row.job_fair.city}</p><p>{row.job_fair.attendance_mode} · {row.status} · Fair: {row.fair_status}</p><Link to={'/job-fairs/'+row.job_fair.id}>View fair</Link>{row.status==='active'&&new Date(row.job_fair.start_at)>new Date()&&<button className="button-secondary" disabled={busy} onClick={()=>{if(window.confirm('Withdraw this job fair registration?'))action('/participant/job-fair-registrations/'+row.id+'/withdraw/','POST');}}>Withdraw job fair registration</button>}{row.withdrawn_at&&<p>Withdrawn: {date(row.withdrawn_at)}</p>}</article>)}{!registrations.data.results.length&&<p>No job fair registrations.</p>}<Pager data={registrations.data} page={rp} onPage={setRp}/></>}</Panel></>;
  }
  const fields=[['title','Fair title'],['description','Fair description'],['venue','Fair venue'],['city','Fair city'],['university','Fair university'],['eligibility','Fair eligibility'],['official_website_url','Official website'],['external_registration_url','External registration URL']];
  const localDate=value=>{if(!value)return '';const d=new Date(value);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};
  function Editor({fair,onSaved,onCancel}){
    const [values,setValues]=useState(()=>({...Object.fromEntries(fields.map(([name])=>[name,fair?.[name]||''])),event_format:fair?.event_format||'onsite',attendance_mode:fair?.attendance_mode||'internal',...Object.fromEntries(['start_at','end_at','registration_deadline'].map(name=>[name,localDate(fair?.[name])]))})),[busy,setBusy]=useState(false),[error,setError]=useState('');
    const change=e=>setValues(v=>({...v,[e.target.name]:e.target.value}));
    async function save(e){e.preventDefault();setBusy(true);setError('');try{const body={...values};for(const name of ['start_at','end_at','registration_deadline'])body[name]=body[name]?new Date(body[name]).toISOString():null;const result=await requestApi('/organizer/job-fairs/'+(fair?fair.id+'/':''),{method:fair?'PATCH':'POST',body});onSaved(result);}catch(e){setError(errorText(e));}finally{setBusy(false);}}
    return <Panel title={fair?'Edit job fair draft':'New job fair draft'}><form onSubmit={save}>{fields.map(([name,label])=><label className="form-field" key={name}><span>{label}</span>{['description','eligibility'].includes(name)?<textarea className="form-input" aria-label={label} name={name} value={values[name]} onChange={change}/>:<input className="form-input" aria-label={label} name={name} value={values[name]} onChange={change}/>}</label>)}{['start_at','end_at','registration_deadline'].map(name=><label className="form-field" key={name}>{name.replace(/_/g,' ')}<input className="form-input" aria-label={name} type="datetime-local" name={name} value={values[name]} onChange={change}/></label>)}<label>Format<select className="form-input" aria-label="Fair event format" name="event_format" value={values.event_format} onChange={change}>{['onsite','online','hybrid'].map(x=><option key={x} value={x}>{x}</option>)}</select></label><label>Attendance<select className="form-input" aria-label="Fair attendance mode" name="attendance_mode" value={values.attendance_mode} onChange={change}><option value="internal">Internal</option><option value="external">External</option></select></label>{error&&<Notice error>{error}</Notice>}<div className="work-item-actions"><button className="button-primary" disabled={busy}>Save job fair draft</button><button className="button-secondary" type="button" onClick={onCancel}>Cancel edit</button></div></form></Panel>;
  }
  function Registrants({id}){const [page,setPage]=useState(1),state=useData('/organizer/job-fairs/'+id+'/registrations/?page='+page);return <Panel title="Job fair registrants"><p className="small-note">Only participant references, registration status and timestamps are shared. No private profile/contact fields.</p><Status state={state}/>{state.data&&<>{state.data.results.map(row=><p key={row.id}>{row.participant_label} · {row.status} · {date(row.registered_at)}{row.withdrawn_at?' · Withdrawn '+date(row.withdrawn_at):''}</p>)}{!state.data.results.length&&<p>No registrations yet.</p>}<Pager data={state.data} page={page} onPage={setPage}/></>}</Panel>;}
  function Organizer(){
    const [page,setPage]=useState(1),[revision,setRevision]=useState(0),[editor,setEditor]=useState(null),[selected,setSelected]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),state=useData('/organizer/job-fairs/?page='+page,revision);
    async function submit(fair){setBusy(true);try{await requestApi('/organizer/job-fairs/'+fair.id+'/submit/',{method:'POST',body:{}});setMessage('Job fair submitted for staff review.');setRevision(r=>r+1);}catch(e){setMessage(errorText(e));}finally{setBusy(false);}}
    return <><Status state={state}/>{message&&<Notice>{message}</Notice>}{state.data&&<><button className="button-primary" onClick={()=>setEditor({new:true})}>Create job fair</button>{editor&&<Editor key={editor.id||'new'} fair={editor.new?null:editor} onCancel={()=>setEditor(null)} onSaved={()=>{setEditor(null);setMessage('Job fair draft saved. Submit it when ready.');setRevision(r=>r+1);}}/>}<Panel title="My job fairs">{state.data.results.map(f=><article className="work-list-item" data-fair-id={f.id} key={f.id}><h3>{f.title||'Untitled draft'}</h3><p>{f.status} · {date(f.start_at)} · {f.attendance_mode}</p>{f.reviewer_note&&<p>Reviewer note: {f.reviewer_note}</p>}{['draft','rejected'].includes(f.status)&&<div className="work-item-actions"><button className="button-secondary" disabled={busy} onClick={()=>setEditor(f)}>Edit job fair</button><button className="button-primary" disabled={busy} onClick={()=>submit(f)}>Submit job fair for review</button></div>}{f.status==='published'&&<Link to={'/job-fairs/'+f.id}>View published fair</Link>}{f.attendance_mode==='internal'&&<button className="button-secondary" onClick={()=>setSelected(f.id)}>View job fair registrants</button>}</article>)}{!state.data.results.length&&<p>No job fair drafts yet.</p>}<Pager data={state.data} page={page} onPage={setPage}/></Panel>{selected&&<Registrants key={selected} id={selected}/>}</>}</>;
  }
  function Review(){
    const [filter,setFilter]=useState('pending_review'),[page,setPage]=useState(1),[revision,setRevision]=useState(0),[notes,setNotes]=useState({}),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),state=useData('/job-fair-review/?status='+filter+'&page='+page,revision);
    async function decide(fair,action){setBusy(true);try{await requestApi('/job-fair-review/'+fair.id+'/',{method:'PATCH',body:{action,note:notes[fair.id]||''}});setMessage('Job fair decision recorded: '+action);setRevision(r=>r+1);}catch(e){setMessage(errorText(e));}finally{setBusy(false);}}
    return <Panel title="Job fair review"><p>Separate from competition import review. Check organizer details, dates and external links before publication.</p><select className="form-input" aria-label="Job fair review status" value={filter} onChange={e=>{setFilter(e.target.value);setPage(1);}}>{['pending_review','published','rejected','cancelled','all'].map(x=><option key={x} value={x}>{x}</option>)}</select><Status state={state}/>{message&&<Notice>{message}</Notice>}{state.data&&<>{state.data.results.map(f=><article className="work-list-item" data-fair-id={f.id} key={f.id}><h3>{f.title}</h3><p>{f.organizer_name} · {f.status}</p><p>{f.description}</p><p>{date(f.start_at)} — {date(f.end_at)} · Deadline {date(f.registration_deadline)}</p><p>{f.venue} · {f.city} · {f.university} · {f.event_format}</p><p>Eligibility: {f.eligibility} · {f.attendance_mode}</p>{safe(f.external_registration_url)&&<a className="inline-link" target="_blank" rel="noopener noreferrer" href={safe(f.external_registration_url)}>Inspect external registration ↗</a>}<textarea className="form-input" aria-label={'Job fair review note '+f.id} value={notes[f.id]||''} onChange={e=>setNotes(n=>({...n,[f.id]:e.target.value}))}/>{f.status==='pending_review'&&<div className="work-item-actions"><button className="button-primary" disabled={busy} onClick={()=>decide(f,'approve')}>Approve job fair</button><button className="button-secondary" disabled={busy} onClick={()=>decide(f,'reject')}>Reject job fair</button></div>}{f.status==='published'&&<button className="button-secondary" disabled={busy} onClick={()=>decide(f,'cancel')}>Cancel published job fair</button>}<details><summary>Job fair publication history ({f.reviews.length})</summary>{f.reviews.map(r=><p key={r.id}>{r.action} · {date(r.created_at)} · {r.note}</p>)}</details></article>)}{!state.data.results.length&&<p>No job fairs in this review state.</p>}<Pager data={state.data} page={page} onPage={setPage}/></>}</Panel>;
  }
  return {Directory,Home:()=> <Directory home/>,Detail,Participant,Organizer,Review};
};
