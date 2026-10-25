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
          <div className="workspace-preview-note"><Icon name="info" className="w-4 h-4" /><span>{live ? 'Connected controls · A staff account is required. Source runs and review decisions affect Django records.' : admin ? 'Sample data · Changes stay in this browser. No real users are moderated, events published, or sources contacted.' : 'Workspace activity is a preview. Your saved profile comes from Django; signed-out demo edits stay in this browser.'}</span></div>
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
        <p>Login sessions use the Django backend. Password recovery is not connected yet.</p>
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
  function ProfileEditForm({ role, account, requestApi, onCancel, onSaved }) {
    const profile = account.profile || {};
    const [values,setValues] = useState(() => role === 'participant' ? {
      full_name: profile.full_name || account.display_name || '',
      current_status: profile.current_status || '',
      institution_name: profile.institution_name || '',
      bio: profile.bio || '',
      skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
      github_url: profile.github_url || '',
      linkedin_url: profile.linkedin_url || '',
      availability_preferences: Array.isArray(profile.availability_preferences) ? profile.availability_preferences : []
    } : role === 'organizer' ? {
      organization_name: profile.organization_name || account.display_name || '',
      organizer_type: profile.organizer_type || '',
      is_affiliated: profile.is_affiliated ? 'true' : 'false',
      institution_name: profile.institution_name || '',
      department: profile.department || '',
      club_organization_name: profile.club_organization_name || '',
      description: profile.description || '',
      website_url: profile.website_url || ''
    } : {
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
      bio: values.bio,
      skills: String(values.skills || '').split(',').map(skill => skill.trim()).filter(Boolean),
      github_url: values.github_url,
      linkedin_url: values.linkedin_url,
      availability_preferences: values.availability_preferences
    } : role === 'organizer' ? {
      organization_name: values.organization_name,
      organizer_type: values.organizer_type,
      is_affiliated: affiliated,
      ...(affiliated ? {institution_name:values.institution_name} : {}),
      department: values.department,
      club_organization_name: values.club_organization_name,
      description: values.description,
      website_url: values.website_url
    } : {
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
        const updated = await requestApi('/auth/profile/',{method:'PATCH',body:payload()});
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
        {name:'bio',label:'Bio',type:'textarea',required:false,maxLength:5000},
        {name:'skills',label:'Skills',required:false,placeholder:'Separate skills with commas'},
        {name:'github_url',label:'GitHub profile URL',type:'url',required:false,maxLength:200,placeholder:'https://github.com/you'},
        {name:'linkedin_url',label:'LinkedIn profile URL',type:'url',required:false,maxLength:200,placeholder:'https://linkedin.com/in/you'}
      ];
    } else if (role === 'organizer') {
      fields = [
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
      ['Bio', profile.bio],
      ['Skills', profile.skills],
      ['GitHub URL', profile.github_url],
      ['LinkedIn URL', profile.linkedin_url],
      ['Opportunity availability', profile.availability_preferences],
      ['Education', profile.education_info],
      ['Work experience', profile.work_experience],
      ['Profile visibility', profile.is_public]
    ] : organizer ? [
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
    return <><div className="profile-preview-card"><div className="profile-monogram">{initials}</div><div>
        <span className="eyebrow">{role} ACCOUNT PROFILE</span><h2>{name}</h2><p>{subtitle || account.email}</p>
      </div><Badge>Django account</Badge></div>
      {!account.profile && <Notice>This account does not have a saved {role} profile yet. The displayed name comes from the signed-in account.</Notice>}
      <div className="profile-edit-actions">{account.profile && <button type="button" className="button-secondary" onClick={()=>setEditing(true)}>Edit Profile</button>}</div>
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
    if(tab==='overview')body=<WorkspaceOverview role={role} db={db} account={account} accountState={accountState} requestApi={requestApi}/>;
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
  function LiveImports() {
    const [section,setSection]=useState('sources'),[filter,setFilter]=useState('pending'),[revision,setRevision]=useState(0);
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
      const fields=Object.entries(error.data||{}).filter(([key])=>!['detail','run'].includes(key)).map(([key,value])=>(fieldLabels[key]||key.replace(/_/g,' '))+': '+valueText(value));
      return fields.length?fields.join(' · '):error.message||'The import service could not complete this request.';
    }
    useEffect(()=>{
      let active=true;
      setState(s=>({...s,status:'loading',error:''}));
      const query=filter==='all'?'':'?status='+encodeURIComponent(filter);
      Promise.all([requestApi('/discovery/sources/'),requestApi('/discovery/candidates/'+query),requestApi('/discovery/runs/')]).then(([sources,candidates,runs])=>{
        if(active)setState({status:'ready',sources:asRows(sources),candidates:asRows(candidates),runs:asRows(runs),error:''});
      }).catch(error=>{
        if(active)setState(s=>({...s,status:error.status===401||error.status===403?'forbidden':'error',error:errorText(error)}));
      });
      return()=>{active=false;};
    },[filter,revision]);
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
      const review_notes=(notes[candidate.id]||'').trim();
      if(action==='reject'&&!review_notes){setFeedback({error:true,text:'Add a review note before rejecting this imported competition.'});return;}
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
      <div className="live-import-heading"><div><span className="live-service-badge"><span/>LIVE DATABASE CONTROLS</span><p>Codeforces uses its official public API. Facebook and other source types require a supported connector and authorization before collection can be enabled.</p></div>
        <button className="button-secondary" disabled={!!busy||state.status==='loading'} onClick={()=>setRevision(r=>r+1)}>Refresh</button>
      </div>
      {feedback&&<div className="workspace-feedback"><Notice error={feedback.error}>{feedback.text}</Notice><button aria-label="Dismiss import update" onClick={()=>setFeedback(null)}>×</button></div>}
      <div className="page-tabs live-import-tabs" role="group" aria-label="Live import sections">{[['sources','Sources'],['review','Review queue'],['history','Run history']].map(([id,label])=><button key={id} aria-pressed={section===id} className={section===id?'active':''} onClick={()=>setSection(id)}>{label}{id==='review'&&state.status==='ready'&&<span>{state.candidates.length}</span>}</button>)}</div>
      {state.status==='loading'&&<div className="live-import-loading" role="status"><Icon name="clock" className="w-5 h-5"/>Loading current source, review, and run records…</div>}
      {state.status==='ready'&&section==='sources'&&<>
        <Panel title="Your active discovery network" icon="layoutgrid">
          {!state.sources.length&&<EmptyState title="No sources configured yet" text="Run the Django discovery bootstrap command or add supported source records in Django Admin."/>}
          {state.sources.map(source=>{
            const supported=source.can_run!==false&&source.connector==='codeforces';
            return <ListItem key={source.id} title={source.name} subtitle={source.connector==='codeforces'?'Official Codeforces contest feed':source.connector==='facebook'?'Facebook · authorization required':source.connector} badge={!supported?'Unavailable':source.enabled?'Enabled':'Paused'}>
              <div className="live-source-details"><div><span>Last checked</span><strong>{date(source.last_checked_at)}</strong></div><div><span>Publication</span><strong>{source.auto_publish?'New listings publish automatically':'New listings wait for review'}</strong></div></div>
              {source.last_error&&<div className="import-warning duplicate"><Icon name="info" className="w-4 h-4"/>{source.last_error}</div>}
              {!supported&&<p className="work-item-copy">This source cannot be collected yet. A public Page link alone does not authorize automated Facebook access. No login cookies, passwords, or access tokens should be entered here.</p>}
              <div className="live-source-controls">
                <label>Check interval<select aria-label={'Check interval for '+source.name} className="form-input" value={source.interval_minutes} disabled={!!busy||!supported} onChange={e=>mutate('source-'+source.id,'/discovery/sources/'+source.id+'/',{interval_minutes:Number(e.target.value)},'Source interval saved. The background collector uses this schedule.')}>
                  {[15,30,60,180,360,720,1440].map(minutes=><option key={minutes} value={minutes}>{minutes<60?minutes+' minutes':minutes===60?'Every hour':minutes===1440?'Daily':'Every '+minutes/60+' hours'}</option>)}
                  {![15,30,60,180,360,720,1440].includes(source.interval_minutes)&&<option value={source.interval_minutes}>{source.interval_minutes} minutes</option>}
                </select></label>
                <label className="live-auto-publish"><input type="checkbox" checked={!!source.auto_publish} disabled={!!busy||!supported} onChange={e=>mutate('source-'+source.id,'/discovery/sources/'+source.id+'/',{auto_publish:e.target.checked},'Publication preference saved for future imports. Existing review decisions are unchanged.')}/><span>Automatically publish new listings from this source</span></label>
              </div>
              <div className="work-item-actions"><button className="button-secondary" disabled={!!busy||!supported} onClick={()=>mutate('source-'+source.id,'/discovery/sources/'+source.id+'/',{enabled:!source.enabled},source.enabled?'Source paused.':'Source enabled.')}>{source.enabled?'Pause source':'Enable source'}</button>
                <button className="button-primary" disabled={!!busy||!supported||!source.enabled} onClick={()=>mutate('run-'+source.id,'/discovery/sources/'+source.id+'/run/',{},'Collection run recorded. Review its results in Run history.')}>{busy==='run-'+source.id?'Checking source…':'Run now'}</button>
              </div>
            </ListItem>;
          })}
        </Panel>
        <Panel title="Automatic discovery, accountable publication" icon="shieldcheck"><p>Collection intervals are used by the background worker. Keep new sources in manual review until you trust their data. Missing deadlines, eligibility, prizes, and fees stay unknown; an imported listing is not automatically a verified event.</p><a className="inline-link" href={djangoAdminUrl} target="_blank" rel="noopener noreferrer">Manage source records in Django Admin ↗</a></Panel>
      </>}
      {state.status==='ready'&&section==='review'&&<Panel title="Imported competitions" icon="eye">
        <div className="work-panel-actions"><span>{state.candidates.length} candidates in this view</span><select className="form-input" aria-label="Live import review status" value={filter} disabled={!!busy} onChange={e=>setFilter(e.target.value)}>{[['pending','New imports'],['update_pending','Source updates'],['approved','Approved'],['rejected','Rejected'],['all','All statuses']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
        {!state.candidates.length&&<EmptyState title="This review queue is clear" text="Run an enabled source, or choose another review status."/>}
        {state.candidates.map(candidate=>{
          const payload=candidate.payload||{},changes=Object.entries(candidate.changes||{}),sourceUrl=safeLink(payload.source_url||payload.registration_url),isUpdate=candidate.status==='update_pending';
          return <ListItem key={candidate.id} title={candidate.title||payload.title||'Untitled imported competition'} subtitle={candidate.source_name+' · '+(payload.organizer_name||payload.host_organization||'Organizer not provided')} badge={candidate.status.replace(/_/g,' ')}>
            <p className="work-item-copy">{payload.description||'Description not provided by the source.'}</p>
            <dl className="import-facts"><div><dt>Start time</dt><dd>{payload.event_start_date?date(payload.event_start_date):'Not provided'}</dd></div><div><dt>Registration deadline</dt><dd>{payload.registration_deadline?date(payload.registration_deadline):'Not provided · check the source'}</dd></div><div><dt>Original announcement</dt><dd>{sourceUrl?<a href={sourceUrl} target="_blank" rel="noopener noreferrer">Open source ↗</a>:'Not provided'}</dd></div></dl>
            {Array.isArray(candidate.warnings)&&candidate.warnings.map((warning,i)=><div className="import-warning duplicate" key={i}><Icon name="info" className="w-4 h-4"/>{valueText(warning)}</div>)}
            {isUpdate&&changes.length>0&&<details className="live-change-summary"><summary>{changes.length} source changes to review</summary><dl>{changes.map(([field,change])=><div key={field}><dt>{fieldLabels[field]||field.replace(/_/g,' ')}</dt><dd>{change&&typeof change==='object'&&!Array.isArray(change)?<><span>Before: {valueText(change.old??change.before)}</span><strong>Source: {valueText(change.new??change.after)}</strong></>:<strong>{valueText(change)}</strong>}</dd></div>)}</dl></details>}
            {(candidate.status==='pending'||isUpdate)&&<><label className="work-label live-review-note">Review note<textarea className="form-input" aria-label={'Review note for '+(candidate.title||payload.title||candidate.id)} rows={2} maxLength={2000} value={notes[candidate.id]||''} onChange={e=>setNotes(n=>({...n,[candidate.id]:e.target.value}))} placeholder="Explain a rejection or add context for this decision."/></label>
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
      imports:()=> <Imports {...props}/>,history:()=> <ImportHistory db={db}/>,rankings:()=> <ResultsReview {...props}/>,fairs:()=> <Fairs {...props}/>};
    const djangoAdminUrl='http://'+(window.location.hostname==='localhost'?'localhost':'127.0.0.1')+':8001/admin/';
    return <Shell admin live={tab==='live-imports'} tab={tab} menu={adminMenu} heading={tab==='live-imports'?'Live competition imports':'Preview only · '+(tab==='overview'?'A thriving sphere starts here.':adminMenu.find(([id])=>id===tab)[1])}>
      {tab!=='live-imports'&&<Notice error>These admin sections use sample data. Use Live imports for the real collector and import review, or Django Admin for organizer submissions. <Link className="inline-link" to={adminRoute('live-imports')}>Open Live imports →</Link><a className="inline-link" href={djangoAdminUrl} target="_blank" rel="noopener noreferrer">Open Django Admin ↗</a></Notice>}
      {error&&<Notice error>{error}</Notice>}{feedback&&<div className="workspace-feedback"><Notice error={feedback.error}>{feedback.text}</Notice><button aria-label="Dismiss update" onClick={()=>setFeedback(null)}>×</button></div>}
      <div key={tab}>{tab==='live-imports'?<LiveImports/>:content[tab]()}</div>
    </Shell>;
  }
  return { WorkspacePage, AdminPage };
};
