/* Frontend routes and page layouts. Account credentials are sent only to the Django auth API. */
(() => {
  const { useState, useEffect } = React;
  const { Icon, Navbar, HeroSection, ExploreCompetitionsSection, ExploreCompetitionsPage, JobFairSection, RankingsSection, Footer } = window.TalentSphereUI;
  const DATA = window.TALENTSPHERE_DATA;
  const AUTH_HOST = window.location.hostname === 'localhost' ? 'localhost' : '127.0.0.1';
  const AUTH_API = 'http://' + AUTH_HOST + ':8001/api';
  let participantSessionRequest = null;
  let csrfToken = '';
  const SUBMIT_PATH = '/workspace?role=organizer&tab=create';
  const sectionPaths = { hero: '/', competitions: '/competitions', jobfairs: '/job-fairs', rankings: '/rankings', workspace: '/workspace',
    participant: '/workspace?role=participant', organizer: '/workspace?role=organizer', recruiter: '/workspace?role=recruiter', admin: '/admin' };
  const authPath = (view) => view === 'login' ? '/login' : view === 'forgot-password' ? '/login?view=recovery' :
    '/signup' + (['participant', 'organizer', 'recruiter'].includes(view) ? '?role=' + view : '');
  const titles = { '/': 'Discover your next opportunity', '/login': 'Login', '/signup': 'Create your account',
    '/forgot-password': 'Password recovery', '/competitions': 'Explore CSE Competitions', '/job-fairs': 'Job fairs',
    '/rankings': 'Rankings', '/workspace': 'My workspace', '/admin': 'Admin workspace',
    '/organizer/competitions/new': 'Create competition', '/help': 'Help & contact', '/privacy': 'Privacy policy', '/terms': 'Terms of use',
    '/preview/access-denied': 'Access restricted', '/preview/loading': 'Loading preview' };

  function navigate(to) {
    if (to === window.location.pathname + window.location.search) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  function Link({ to, children, className = '', ...props }) {
    return <a href={to} className={className} {...props} onClick={(e) => {
      if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        e.preventDefault(); navigate(to);
      }
    }}>{children}</a>;
  }
  function readStored(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  async function requestApi(path, { method = 'GET', body } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) {
      if (!csrfToken) {
        const csrfResponse = await fetch(AUTH_API + '/auth/csrf/', { credentials: 'include', headers });
        if (!csrfResponse.ok) throw new Error('Could not start a secure connection to the account service.');
        csrfToken = (await csrfResponse.json()).csrfToken;
      }
      if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json';
      headers['X-CSRFToken'] = csrfToken;
    }
    const response = await fetch(AUTH_API + path, {
      method,
      credentials: 'include',
      headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.detail || 'The account request could not be completed.');
      error.status = response.status;
      error.data = data;
      throw error;
    }
    if (['/auth/register/', '/auth/login/', '/auth/logout/', '/auth/password/reset/'].includes(path)) {
      csrfToken = ''; participantSessionRequest = null;
      window.dispatchEvent(new Event('talent-account-change'));
    }
    return data;
  }
  function apiFieldErrors(data) {
    const result = {};
    Object.entries(data || {}).forEach(([name, messages]) => {
      if (name === 'detail' || name === 'non_field_errors') return;
      result[name] = Array.isArray(messages) ? messages.join(' ') : String(messages);
    });
    return result;
  }
  function PreviewNotice() {
    return <p className="preview-notice"><Icon name="info" className="w-4 h-4" />Registration and login use secure Django sessions. Competition and job fair bookmarks and registrations use Django; job applications and rankings remain previews.</p>;
  }
  function Breadcrumb({ parent, label }) {
    return <nav aria-label="Breadcrumb" className="breadcrumb">
      <Link to="/">Home</Link><span aria-hidden="true">/</span>
      {parent && <><Link to={parent.to}>{parent.label}</Link><span aria-hidden="true">/</span></>}
      <span aria-current="page">{label}</span>
    </nav>;
  }
  function PageHeader({ eyebrow, title, accent, description, icon = 'sparkles', parent, children }) {
    return <header className="page-header bg-radial-gradient">
      <div className="page-container">
        <Breadcrumb parent={parent} label={title} />
        <div className="page-header-row">
          <div>
            <span className="eyebrow"><Icon name={icon} className="w-4 h-4" />{eyebrow}</span>
            <h1>{title} {accent && <span className="gradient-text-hero">{accent}</span>}</h1>
            <p className="page-description">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </header>;
  }
  function Notice({ children, error = false }) {
    return <div className={'notice ' + (error ? 'notice-error' : '')} role={error ? 'alert' : 'status'}>
      <Icon name={error ? 'info' : 'checkcircle2'} className="w-5 h-5" /><div>{children}</div>
    </div>;
  }
  function EmptyState({ title, text, onReset }) {
    return <div className="empty-state"><Icon name="search" className="w-9 h-9" /><h2>{title}</h2><p>{text}</p>
      {onReset && <button className="button-secondary" onClick={onReset}>Clear filters</button>}</div>;
  }
  function InfoRow({ icon, label, value }) {
    return <div className="info-row"><Icon name={icon} className="w-5 h-5" /><div><span>{label}</span><strong>{value}</strong></div></div>;
  }
  function Panel({ title, children, icon }) {
    return <section className="content-panel">{title && <h2>{icon && <Icon name={icon} className="w-5 h-5" />}{title}</h2>}{children}</section>;
  }
  function Field({ label, name, type = 'text', value, onChange, error, options, hint, required = true, ...props }) {
    const [visible, setVisible] = useState(false);
    const id = 'field-' + name;
    const common = { id, name, value, onChange, required, 'aria-invalid': !!error,
      'aria-describedby': error ? id + '-error' : hint ? id + '-hint' : undefined,
      className: 'form-input' + (error ? ' has-error' : '') };
    return <div className="field">
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <div className={type === 'password' ? 'password-field' : ''}>
        {options ? <select {...common} {...props}><option value="">Select an option</option>
          {options.map(o => <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>)}</select> :
          type === 'textarea' ? <textarea {...common} rows={5} {...props} /> :
            <input {...common} type={type === 'password' && visible ? 'text' : type} {...props} />}
        {type === 'password' && <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(!visible)}>
          <Icon name={visible ? 'eyehide' : 'eye'} className="w-5 h-5" /></button>}
      </div>
      {error ? <p className="field-error" id={id + '-error'}>{error}</p> : hint && <p className="field-hint" id={id + '-hint'}>{hint}</p>}
    </div>;
  }
  function formErrors(form) {
    const errors = {};
    Array.from(form.elements).forEach(el => {
      if (el.name && el.willValidate && (!el.validity.valid || (el.required && !el.value.trim()))) {
        errors[el.name] = el.validity.valueMissing || (el.required && !el.value.trim()) ? 'Please complete this field.' :
          el.validity.typeMismatch ? 'Please enter a valid ' + (el.type === 'email' ? 'email address.' : 'website URL, including https://.') :
          el.validity.tooShort ? 'Please use at least ' + el.minLength + ' characters.' : el.validationMessage;
      }
    });
    return errors;
  }
  function focusError(form, errors) {
    const first = form.elements.namedItem(Object.keys(errors)[0]);
    first?.focus();
  }

  function AuthPage({ mode, search }) {
    const params = new URLSearchParams(search);
    const selected = params.get('role');
    const role = ['participant', 'organizer', 'recruiter'].includes(selected) ? selected : '';
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');
    const [noticeError, setNoticeError] = useState(false);
    const [busy, setBusy] = useState(false);
    const [availability, setAvailability] = useState([]);
    const [signupPhoto,setSignupPhoto]=useState(null),[signupPreview,setSignupPreview]=useState('');
    useEffect(()=>{if(!signupPhoto){setSignupPreview('');return;}const url=URL.createObjectURL(signupPhoto);setSignupPreview(url);return()=>URL.revokeObjectURL(url);},[signupPhoto]);
    const isSignup = mode === 'signup', isForgot = mode === 'forgot-password';
    const next = params.get('next');
    const safeNext = next && (next.startsWith('/competitions/') || next.startsWith('/job-fairs/') || next === SUBMIT_PATH) ? next : null;
    const title = isSignup ? 'Create your account' : isForgot ? 'Forgot your password?' : 'Welcome back';
    const description = isSignup ? 'A place for your skills. A path to your next opportunity.' : isForgot ?
      'Enter your account email to start your recovery.' : 'Your next challenge, connection, and breakthrough await.';
    const setRole = (r) => navigate('/signup?role=' + r + (safeNext ? '&next=' + encodeURIComponent(safeNext) : ''));
    useEffect(() => { setValues({}); setErrors({}); setNotice(''); setNoticeError(false); setAvailability([]); setSignupPhoto(null); }, [role]);
    const field = (name, label, extra = {}) => <Field name={name} label={label} value={values[name] || ''} error={errors[name]}
      onChange={(e) => { setValues(v => ({ ...v, [name]: e.target.value })); setErrors(x => ({ ...x, [name]: '' })); setNotice(''); setNoticeError(false); }} {...extra} />;
    async function submit(e) {
      e.preventDefault();
      const form = e.currentTarget;
      const invalid = formErrors(form);
      if (!isForgot && isSignup && (values.password || '').length < 8) invalid.password = 'Use at least 8 characters.';
      if (isSignup && values.password !== values.confirm_password) invalid.confirm_password = 'Your passwords do not match.';
      if (isSignup && role === 'participant') {
        for (const [name, domain] of [['github_url', 'github.com'], ['linkedin_url', 'linkedin.com']]) {
          if (!values[name]) continue;
          try {
            const address = new URL(values[name]);
            if (!['http:', 'https:'].includes(address.protocol) || ![domain, 'www.' + domain].includes(address.hostname) || address.pathname === '/')
              invalid[name] = 'Enter your profile URL on ' + domain + '.';
          } catch { invalid[name] = 'Enter your profile URL on ' + domain + '.'; }
        }
      }
      if (Object.keys(invalid).length) { setErrors(invalid); focusError(form, invalid); return; }
      setBusy(true);
      setNotice('');
      setNoticeError(false);
      try {
        if (isForgot) {
          const result = await requestApi('/auth/password/forgot/', {method:'POST', body:{email:values.email}});
          setNotice(result.detail + (result.delivery_mode === 'local' ? ' Local development mode: messages are saved in the project’s private backend/.runtime/emails folder; nothing is sent to your email inbox.' : ' Check your inbox and spam folder.'));
          return;
        }
        if (isSignup) {
          const payload = {
            role,
            email: values.email,
            password: values.password,
            confirm_password: values.confirm_password
          };
          if (role === 'participant') Object.assign(payload, {
            full_name: values.full_name,
            current_status: values.current_status,
            institution_name: values.institution_name || '',
            github_url: values.github_url || '',
            linkedin_url: values.linkedin_url || '',
            bio: values.bio || '',
            skills: (values.skills || '').split(',').map(skill => skill.trim()).filter(Boolean),
            education_info: values.education_info || '',
            work_experience: values.work_experience || '',
            availability_preferences: availability
          });
          if (role === 'organizer') Object.assign(payload, {
            organization_name: values.organization_name,
            organizer_type: values.organizer_type,
            is_affiliated: values.is_affiliated === 'yes',
            institution_name: values.institution_name || '',
            department: values.department || '',
            club_organization_name: values.club_organization_name || '',
            website_url: values.website_url || '',
            description: values.description || ''
          });
          if (role === 'recruiter') Object.assign(payload, {
            recruiter_name: values.recruiter_name,
            company_name: values.company_name,
            company_website: values.company_website || '',
            company_description: values.company_description || '',
            recruiter_designation: values.recruiter_designation || ''
          });
          const result = await requestApi('/auth/register/', { method: 'POST', body: payload });
          if(signupPhoto){
            try{const imageForm=new FormData();imageForm.append('image',signupPhoto);await requestApi('/auth/profile/images/photo/',{method:'POST',body:imageForm});}
            catch{navigate('/workspace?role='+encodeURIComponent(result.role)+'&tab=profile&photo=retry');return;}
          }
          navigate('/workspace?role=' + encodeURIComponent(result.role));
        } else {
          const result = await requestApi('/auth/login/', {
            method: 'POST', body: { email: values.email, password: values.password }
          });
          navigate('/workspace?role=' + encodeURIComponent(result.role));
        }
      } catch (error) {
        const fieldErrors = apiFieldErrors(error.data);
        if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
        setNotice(error.data ? error.message : 'Could not connect to the account service. Start the Django backend on port 8001 and try again.');
        setNoticeError(true);
      } finally {
        setBusy(false);
      }
    }
    return <div className="auth-page bg-radial-gradient"><div className="page-container">
      <Breadcrumb label={isSignup ? 'Sign up' : isForgot ? 'Password recovery' : 'Login'} />
      <div className="auth-layout">
        <aside className="auth-story">
          <span className="eyebrow"><Icon name="zap" className="w-4 h-4" />YOUR NEXT CHAPTER</span>
          <h1>{isForgot ? <>Let's get you{' '}<br /><span className="gradient-text-hero">back on track.</span></> :
            <>Big ideas.{' '}<br />Bold ambitions.{' '}<br /><span className="gradient-text-hero">Your sphere.</span></>}</h1>
          <p>One community to challenge yourself, showcase your talent, and discover what comes next.</p>
          <div className="auth-benefits">
            <InfoRow icon="trophy" label="Challenge yourself" value="Find competitions that match your skills" />
            <InfoRow icon="briefcase" label="Make your next move" value="Meet companies looking for talent like you" />
            <InfoRow icon="trendingup" label="Let your work speak" value="Build a profile around your achievements" />
          </div>
          <div className="auth-story-bottom"><div className="avatar-stack">{['AR','SK','DC','PS'].map(s => <span key={s}>{s}</span>)}</div><p>A community built for<br /><strong>builders, thinkers & doers.</strong></p></div>
        </aside>
        <section className="auth-card glass-modal">
          <div className="form-icon"><Icon name={isSignup ? 'sparkles' : isForgot ? 'shieldcheck' : 'user'} className="w-6 h-6" /></div>
          <h2>{title}</h2><p className="form-description">{description}</p>
          {isSignup && <><div className="step-caption">01 / CHOOSE YOUR ROLE <span>02 / YOUR DETAILS</span></div>
            <div className="role-options" aria-label="Account type">{[
              ['participant', 'Participant', 'Compete & grow', 'user'], ['organizer', 'Organizer', 'Create experiences', 'rocket'],
              ['recruiter', 'Recruiter', 'Discover talent', 'briefcase']
            ].map(([id, label, sub, icon]) => <button key={id} className={'role-option ' + (role === id ? 'selected' : '')} aria-pressed={role === id}
              onClick={() => setRole(id)}><Icon name={icon} className="w-5 h-5" /><strong>{label}</strong><span>{sub}</span></button>)}</div></>}
          {(!isSignup || role) && <form onSubmit={submit} noValidate className="page-form">
            {isSignup && <div className="form-section-title">{role.charAt(0).toUpperCase() + role.slice(1)} details</div>}
            {isSignup && role === 'participant' && field('full_name', 'Full name', { autoComplete: 'name', placeholder: 'Your full name' })}
            {isSignup && role === 'organizer' && field('organization_name', 'Organization / club name', { autoComplete: 'organization', placeholder: 'Your organization' })}
            {isSignup && role === 'recruiter' && <>
              {field('recruiter_name', 'Recruiter name', { autoComplete: 'name', placeholder: 'Your full name' })}
              {field('company_name', 'Company name', { autoComplete: 'organization', placeholder: 'Where you work' })}
            </>}
            {field('email', isSignup && role === 'recruiter' ? 'Official email' : 'Email address', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}
            {!isForgot && field('password', 'Password', { type: 'password', autoComplete: isSignup ? 'new-password' : 'current-password', placeholder: isSignup ? 'Create a strong password' : 'Enter your password', minLength: isSignup ? 8 : undefined, hint: isSignup ? 'Use at least 8 characters.' : undefined })}
            {isSignup && field('confirm_password', 'Confirm password', { type: 'password', autoComplete: 'new-password', placeholder: 'Re-enter your password' })}
            {isSignup && role === 'participant' && <>
              {field('current_status', 'Current status', { options: [
                'University Student', 'College Student', 'School Student', 'Working Professional', 'Unemployed / Not Currently Studying'
              ] })}
              {values.current_status && values.current_status !== 'Unemployed / Not Currently Studying' && field('institution_name',
                values.current_status === 'Working Professional' ? 'Workplace name' :
                  values.current_status === 'University Student' ? 'University name' :
                    values.current_status === 'College Student' ? 'College name' : 'School name',
                { autoComplete: 'organization', placeholder: 'Your institution or workplace' })}
              <div className="form-grid">{field('github_url', 'GitHub profile (optional)', { type: 'url', required: false, placeholder: 'https://github.com/you' })}{field('linkedin_url', 'LinkedIn profile (optional)', { type: 'url', required: false, placeholder: 'https://linkedin.com/in/you' })}</div>
              {field('bio', 'Bio (optional)', { type: 'textarea', required: false, placeholder: 'A little about you and what you are working toward.' })}
              {field('skills', 'Skills (optional)', { required: false, placeholder: 'Python, design, teamwork', hint: 'Separate skills with commas.' })}
              {field('education_info', 'Education information (optional)', { type: 'textarea', required: false, placeholder: 'Degree, school, or other education details.' })}
              {field('work_experience', 'Work experience (optional)', { type: 'textarea', required: false, placeholder: 'Relevant experience, roles, or projects.' })}
              <fieldset className="availability"><legend>Opportunity availability</legend>{[
                ['Jobs', 'Jobs'], ['Internships', 'Internships'], ['Freelance', 'Freelance'], ['Not Currently Available', 'Not Currently Available']
              ].map(([value, label]) =>
                <label key={value}><input type="checkbox" name="availability_preferences" checked={availability.includes(value)} onChange={() => setAvailability(prev => prev.includes(value) ? prev.filter(x => x !== value) : value === 'Not Currently Available' ? [value] : [...prev.filter(x => x !== 'Not Currently Available'), value])} />{label}</label>)}
                {errors.availability_preferences && <p className="field-error">{errors.availability_preferences}</p>}
              </fieldset>
            </>}
            {isSignup && role === 'organizer' && <>
              {field('organizer_type', 'Organizer type', { options: [
                'University', 'College', 'School', 'Company / Corporate Organization', 'Community Organization', 'Individual Organizer'
              ] })}
              {field('is_affiliated', 'Affiliated with an institution?', { options: [
                { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }
              ] })}
              {values.is_affiliated === 'yes' && field('institution_name', 'Institution name', { autoComplete: 'organization' })}
              {field('department', 'Department (optional)', { required: false, placeholder: 'Department or faculty' })}
              {field('club_organization_name', 'Club / organization name (optional)', { required: false })}
              {field('website_url', 'Website URL (optional)', { type: 'url', required: false, placeholder: 'https://your-organization.com' })}
              {field('description', 'Description (optional)', { type: 'textarea', required: false, placeholder: 'Tell people about your organization.' })}
            </>}
            {isSignup && role === 'recruiter' && <>
              {field('company_website', 'Company website (optional)', { type: 'url', required: false, placeholder: 'https://your-company.com' })}
              {field('company_description', 'Company description (optional)', { type: 'textarea', required: false, placeholder: 'Tell participants about your team and opportunities.' })}
              {field('recruiter_designation', 'Recruiter designation (optional)', { required: false, placeholder: 'For example, Talent Partner' })}
            </>}
            {isSignup&&role&&<div className="signup-photo"><label className="work-label">{role==='organizer'?'Organization logo (optional)':'Profile photo (optional)'}<input name="signup_photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file&&file.size>5*1024*1024){setSignupPhoto(null);setNotice('Choose an image smaller than 5 MB, or add one later in your profile.');setNoticeError(true);}else{setSignupPhoto(file||null);setNotice('');}}}/></label><p className="small-note">JPEG, PNG or WebP, up to 5 MB. You can add or change this later. Your profile starts private.</p>{signupPreview&&<img className="signup-photo-preview" src={signupPreview} alt="Selected profile image preview"/>}</div>}
            {!isSignup && !isForgot && <div className="form-links"><span>Good to see you again.</span><Link to={'/login?view=recovery' + (safeNext ? '&next=' + encodeURIComponent(safeNext) : '')}>Forgot password?</Link></div>}
            {notice && <Notice error={noticeError}>{notice}{safeNext && !noticeError && <Link className="inline-link" to={safeNext}>Return to your event <Icon name="arrowright" className="w-4 h-4" /></Link>}</Notice>}
            <button className="button-primary full-width" disabled={busy} type="submit">{busy ? 'Please wait…' : isForgot ? 'Request reset link' : isSignup ? 'Create account' : 'Login'}<Icon name="arrowright" className="w-4 h-4" /></button>
          </form>}
          {isSignup && !role && <p className="role-prompt">Choose a role above to personalize your registration.</p>}
          <p className="auth-switch">{isSignup ? 'Already part of the community? ' : isForgot ? 'Remember your password? ' : 'New to Talent Square? '}
            <Link to={(isSignup || isForgot ? '/login' : '/signup') + (safeNext ? '?next=' + encodeURIComponent(safeNext) : '')}>{isSignup || isForgot ? 'Login' : 'Create an account'} <span aria-hidden="true">→</span></Link></p>
          {!isForgot && <PreviewNotice />}
          <Link className="inline-link" to={'/workspace?role=' + (role || 'participant')}>Explore the workspace preview <Icon name="arrowright" className="w-4 h-4" /></Link>
        </section>
      </div>
    </div></div>;
  }

  function ResetPasswordPage({search}) {
    const params = new URLSearchParams(search), uid = params.get('uid'), token = params.get('token');
    const [values,setValues] = useState({new_password:'',confirm_password:''});
    const [errors,setErrors] = useState({}), [notice,setNotice] = useState('');
    const [busy,setBusy] = useState(false), [complete,setComplete] = useState(false);
    async function submit(event) {
      event.preventDefault();
      const invalid = formErrors(event.currentTarget);
      if(values.new_password !== values.confirm_password)invalid.confirm_password='Passwords do not match.';
      if(Object.keys(invalid).length){setErrors(invalid);focusError(event.currentTarget,invalid);return;}
      setBusy(true);setNotice('');setErrors({});
      try {
        await requestApi('/auth/password/reset/',{method:'POST',body:{uid,token,...values}});
        setValues({new_password:'',confirm_password:''});setComplete(true);
        window.history.replaceState({},'', '/login?view=reset');
      } catch(error) {
        setErrors(apiFieldErrors(error.data));
        setNotice(error.data ? error.message : 'Could not connect to the account service. Please try again.');
      } finally {setBusy(false);}
    }
    return <div className="auth-page bg-radial-gradient"><div className="page-container">
      <Breadcrumb label="Reset password"/>
      <div className="auth-layout"><aside className="auth-story reset-story glass-panel">
        <span className="eyebrow"><Icon name="shieldcheck" className="w-4 h-4"/>YOUR ACCOUNT, PROTECTED</span>
        <h1>A fresh start.<br/><span className="gradient-text-hero">Back to your sphere.</span></h1>
        <p>Choose a strong password you haven’t used elsewhere. Your account and saved profile stay in place.</p>
      </aside><section className="auth-card glass-modal">
        <div className="form-icon"><Icon name="shieldcheck" className="w-6 h-6"/></div>
        <h2>{complete?'Password updated':'Choose a new password'}</h2>
        {complete?<><Notice>Your password was updated. Sign in with your registered email and new password.</Notice><Link className="button-primary full-width" to="/login">Go to login</Link></>:
          !uid||!token?<><Notice error>This reset link is incomplete. Request a new one.</Notice><Link className="button-primary full-width" to="/login?view=recovery">Request a reset link</Link></>:
          <><p className="form-description">Reset links expire after one hour and can only be used once.</p>
          <form className="page-form" noValidate onSubmit={submit}>
            {['new_password','confirm_password'].map(name=><Field key={name} name={name} type="password" label={name==='new_password'?'New password':'Confirm new password'} autoComplete="new-password" value={values[name]} error={errors[name]} hint={name==='new_password'?'Use at least 8 characters. Avoid common passwords or personal details.':undefined} onChange={event=>{setValues(v=>({...v,[name]:event.target.value}));setErrors(e=>({...e,[name]:''}));}}/>)}
            {notice&&<Notice error>{notice}</Notice>}
            <button className="button-primary full-width" type="submit" disabled={busy}>{busy?'Updating password…':'Save new password'}</button>
          </form><Link className="inline-link" to="/login?view=recovery">Request a new reset link</Link></>}
      </section></div>
    </div></div>;
  }

  function SaveButton({ id, label = 'Save event' }) {
    const [saved, setSaved] = useState(() => { const items = readStored('talentsphere-saved', []); return Array.isArray(items) && items.includes(id); });
    const [error, setError] = useState('');
    function toggle() {
      const stored = readStored('talentsphere-saved', []);
      const items = Array.isArray(stored) ? stored : [];
      try { localStorage.setItem('talentsphere-saved', JSON.stringify(saved ? items.filter(x => x !== id) : [...new Set([...items, id])]));
        setSaved(!saved); setError(''); } catch { setError('Your browser could not save this event.'); }
    }
    return <><button className="button-secondary full-width" onClick={toggle} aria-pressed={saved}><Icon name={saved ? 'checkcircle2' : 'sparkles'} className="w-4 h-4" />{saved ? 'Saved on this device' : label}</button>{error && <p role="alert" className="field-error">{error}</p>}</>;
  }

  function useParticipantSession() {
    const [state,setState]=useState({status:'loading',account:null});
    useEffect(()=>{
      let active=true;
      const load=()=>{
        if(!participantSessionRequest)participantSessionRequest=requestApi('/auth/me/').catch(error=>{if(error.status===401)return null;throw error;});
        participantSessionRequest.then(account=>{if(active)setState({status:account?'ready':'signed-out',account});}).catch(()=>{if(active)setState({status:'error',account:null});});
      };
      load();window.addEventListener('talent-account-change',load);
      return()=>{active=false;window.removeEventListener('talent-account-change',load);};
    },[]);
    return state;
  }

  function useCompetitionActivity(id, session) {
    const [state,setState]=useState({status:'loading'}),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
    async function reload(){const data=await requestApi(`/participant/competitions/${id}/activity/`);setState({status:'ready',...data});}
    useEffect(()=>{
      let active=true;
      if(session.account?.role!=='participant'){setState({status:session.status});return()=>{active=false;};}
      setState({status:'loading'});
      requestApi(`/participant/competitions/${id}/activity/`).then(data=>{if(active)setState({status:'ready',...data});}).catch(error=>{if(active)setState({status:'error',error:error.message});});
      return()=>{active=false;};
    },[id,session.status,session.account?.id]);
    async function mutate(path,method,body={},success='Saved to your account.'){
      if(busy)return;
      setBusy(true);setMessage('');
      try{await requestApi(path,{method,body});await reload();setMessage(success);}
      catch(error){setMessage(error.message);}
      finally{setBusy(false);}
    }
    return {state,busy,message,mutate};
  }

  function ParticipantBookmarkButton({id,title='competition',compact=false}) {
    const session=useParticipantSession(),activity=useCompetitionActivity(id,session);
    if(session.status==='loading')return <span className="small-note">Checking account…</span>;
    if(session.status==='error')return <span role="alert" className="small-note">Account service unavailable.</span>;
    if(session.status==='signed-out')return <Link className="button-secondary" to={'/login?next='+encodeURIComponent('/competitions/'+id)}>Sign in to save</Link>;
    if(session.account?.role!=='participant')return null;
    const {state,busy,message,mutate}=activity;
    if(state.status==='error')return <span role="alert" className="small-note">{state.error}</span>;
    return <div className="participant-bookmark"><button className={compact?'competition-save-button':'button-secondary full-width'} disabled={busy||state.status!=='ready'} aria-label={(state.bookmarked?'Remove bookmark for ':'Bookmark ')+title} aria-pressed={!!state.bookmarked} onClick={()=>mutate(`/participant/competitions/${id}/bookmark/`,state.bookmarked?'DELETE':'POST',{},state.bookmarked?'Bookmark removed.':'Bookmarked in your account.')}>
      {busy?'Saving…':state.bookmarked?'Bookmarked':compact?'Save':'Bookmark competition'}</button>{message&&<p role="status" className="small-note">{message}</p>}</div>;
  }

  function ParticipantCompetitionActions({competition:c}) {
    const session=useParticipantSession(),{state,busy,message,mutate}=useCompetitionActivity(c.id,session);
    const [report,setReport]=useState('interested');
    useEffect(()=>setReport(state.participation?.reported_status||'interested'),[state.participation?.reported_status]);
    const internal=c.registrationMode==='internal',registration=state.registration;
    return <div className="participant-actions">
      {!internal&&(c.registrationUrl?<a className="button-primary full-width" data-official-registration href={c.registrationUrl} target="_blank" rel="noopener noreferrer">{c.submissionSource==='imported'?'Visit official event website':'Register on Official Website'}</a>:<p className="small-note">No confirmed registration link is provided. Read the original announcement.</p>)}
      {!internal&&<p className="small-note">Opening this link does not register you on Talent Square or confirm an external registration.</p>}
      {session.status==='loading'?<p role="status">Checking participant account…</p>:session.status==='error'?<Notice error>Account service unavailable. Reload to try again.</Notice>:session.status==='signed-out'?<Link className="button-secondary" to={'/login?next='+encodeURIComponent('/competitions/'+c.id)}>Sign in to {internal?'register or save':'save or track'}</Link>:session.account?.role==='participant'?<>
        <ParticipantBookmarkButton id={c.id} title={c.title}/>
        {state.status==='loading'&&<p role="status">Loading your activity…</p>}
        {state.status==='error'&&<Notice error>{state.error}</Notice>}
        {internal&&<p className="small-note">Your name and registration status are shared with the organizer. No payment is collected here.</p>}
        {internal&&state.status==='ready'&&(registration?<><p className="registration-status" role="status">{registration.status_label}</p>{registration.registration_status==='active'&&new Date(c.targetDate)>new Date()&&<button className="button-secondary" disabled={busy} onClick={()=>{if(window.confirm('Withdraw this registration? It cannot be reopened.'))mutate(`/participant/registrations/${registration.id}/`,'DELETE',{},'Registration withdrawn. History retained.');}}>Withdraw registration</button>}</>:<><button className="button-primary full-width" disabled={busy||!state.registration_available} onClick={()=>mutate(`/participant/competitions/${c.id}/register/`,'POST',{},'Registered on Talent Square.')}>{busy?'Registering…':'Register on Talent Square'}</button>{!state.registration_available&&<p className="small-note">Registration is closed or its approved configuration is incomplete.</p>}</>)}
        {!internal&&state.status==='ready'&&<form onSubmit={event=>{event.preventDefault();mutate(`/participant/competitions/${c.id}/participation/`,'PUT',{reported_status:report},'Self-reported status saved.');}}><label className="work-label">Your external activity<select className="form-input" aria-label="Your external activity" value={report} disabled={busy} onChange={event=>setReport(event.target.value)}>{[['interested','Interested'],['planning','Planning to Register'],['registered_external','Registered Externally — Self-Reported'],['participated','Participated — Self-Reported'],['completed','Completed — Self-Reported']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><p className="small-note">Self-reported — not verified by Talent Square.</p>{state.participation&&<p role="status">{state.participation.status_label}</p>}<button className="button-secondary" disabled={busy} type="submit">{busy?'Saving…':'Save self-reported status'}</button></form>}
        {message&&<p role="status" className="small-note">{message}</p>}
      </>:<p className="small-note">Bookmarks and participation actions require a Participant account.</p>}
    </div>;
  }
  function CompetitionDetails({ competition: initialCompetition, competitionId }) {
    const [tab, setTab] = useState('Overview');
    const [competition, setCompetition] = useState(initialCompetition || null);
    const [loadState, setLoadState] = useState(initialCompetition ? 'ready' : 'loading');
    useEffect(() => {
      if (initialCompetition || !competitionId) return;
      const host = window.location.hostname === 'localhost' ? 'localhost' : '127.0.0.1';
      const controller = new AbortController();
      fetch(`http://${host}:8001/api/competitions/${encodeURIComponent(competitionId)}/`, {
        signal: controller.signal, headers: { Accept: 'application/json' }
      }).then(async response => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.detail || 'This competition is not publicly available.');
        setCompetition(mapCompetitionRecord(body));
        setLoadState('ready');
      }).catch(error => {
        if (error.name !== 'AbortError') setLoadState('error');
      });
      return () => controller.abort();
    }, [competitionId, initialCompetition]);
    const c = initialCompetition || competition;
    useEffect(() => { if (c) document.title = c.title + ' · Talent Square'; }, [c]);
    if (!c && loadState === 'loading') return <div className="competition-state page-container" role="status"><span className="loading-ring"/><h2>Loading competition details</h2></div>;
    if (!c) return <NotFound />;
    const display = value => value === undefined || value === null || value === '' ? 'Not provided' : value;
    const detailDate = value => {
      if (!value) return 'Not provided';
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    const category = DATA.categories.find(item => item.id === c.category)?.name || c.type || 'CSE competition';
    return <>
      <PageHeader eyebrow={category} title={c.title} description={'Organizer: ' + display(c.organizer)} icon="trophy" parent={{ to: '/competitions', label: 'Competitions' }}>
        <div className="detail-emblem"><Icon name={c.category === 'ai-ml' ? 'brain' : c.category === 'hackathon' ? 'rocket' : 'code2'} className="w-16 h-16" /></div>
      </PageHeader>
      <div className="page-container detail-layout">
        <div className="detail-main">
          <p className="preview-notice"><Icon name="shieldcheck" className="w-4 h-4" />{c.submissionSource === 'imported' ? 'This listing was imported from an external source; import is not an endorsement. Confirm participation rules on the original site.' : "This competition was approved for publication. Confirm the organizer's official instructions before registering."}</p>
          <div className="detail-stats"><InfoRow icon="trophy" label="Prize pool" value={display(c.prizePool)} /><InfoRow icon="users" label="Team size" value={display(c.teamSize)} /><InfoRow icon="mappin" label="Format" value={display(c.mode)} /></div>
          <div className="page-tabs" role="tablist" aria-label="Competition information">{['Overview', 'Schedule', 'Guidelines'].map(t =>
            <button role="tab" id={'contest-tab-' + t} aria-controls="contest-tab-content" aria-selected={tab === t} key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}
              onKeyDown={e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); const tabs = ['Overview', 'Schedule', 'Guidelines']; const next = tabs[(tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : 2)) % 3]; setTab(next); document.getElementById('contest-tab-' + next)?.focus(); } }}>{t}</button>)}</div>
          <div role="tabpanel" id="contest-tab-content" aria-labelledby={'contest-tab-' + tab}>
            {tab === 'Overview' && <><Panel title="About this competition" icon="sparkles"><p>{display(c.description)}</p>{Array.isArray(c.tags) && c.tags.length > 0 && <div className="tag-list">{c.tags.map((t, index) => <span key={`${t}-${index}`}>{t}</span>)}</div>}</Panel>
              <Panel title="Eligibility and host" icon="users"><InfoRow icon="users" label="Eligibility" value={display(c.eligibility)} /><InfoRow icon="building2" label="Host institution or organization" value={display(c.hostOrganization || c.university)} /><InfoRow icon="users" label="Organizer" value={display(c.organizer)} /><InfoRow icon="users" label="Team size" value={display(c.teamSize)} /><InfoRow icon="trophy" label="Registration fee" value={display(c.registrationFee)} /></Panel>
              <Panel title="Competition location" icon="layoutgrid"><InfoRow icon="mappin" label="Location" value={display(c.location)} /><InfoRow icon="building2" label="Institution affiliation" value={display(c.institutionAffiliation)} /></Panel></>}
            {tab === 'Schedule' && <Panel title="Mark your calendar" icon="calendar"><ol className="timeline">
              {c.registrationOpensAt && <li><span>01</span><div><h3>Registration opens</h3><p>{detailDate(c.registrationOpensAt)}</p></div></li>}
              <li><span>02</span><div><h3>Registration deadline</h3><p>{detailDate(c.deadline)}</p></div></li>
              <li><span>03</span><div><h3>Competition date</h3><p>{c.date || detailDate(c.targetDate)}</p></div></li>
            </ol></Panel>}
            {tab === 'Guidelines' && <Panel title="Eligibility and requirements" icon="shieldcheck"><p>{display(c.eligibility)}</p><p className="small-note">Check the organizer's official announcement for complete, current instructions.</p></Panel>}
          </div>
          <Link className="inline-link" to="/competitions"><Icon name="arrowleft" className="w-4 h-4" />Explore more competitions</Link>
        </div>
        <aside className="detail-sidebar"><div className="registration-card">
          <span className="eyebrow">PUBLISHED COMPETITION</span><h2>Competition<br /><span className="gradient-text-hero">information</span></h2>
          <InfoRow icon="calendar" label="Competition date" value={c.date || detailDate(c.targetDate)} /><InfoRow icon="clock" label="Registration deadline" value={detailDate(c.deadline)} />
          <ParticipantCompetitionActions competition={c}/>
          {c.submissionSource === 'imported' && <div className="soft-box"><strong>Imported from {c.sourceName || 'an external source'}</strong><p className="small-note">Last checked: {c.sourceCheckedAt ? new Date(c.sourceCheckedAt).toLocaleString() : 'Not provided'}. Fields missing from the source remain unknown.</p>{c.sourceFreshness?.map(label=><p className="small-note" key={label}>{label}</p>)}</div>}
          {c.sourceUrl ? <a className="inline-link" href={c.sourceUrl} target="_blank" rel="noopener noreferrer">View Original Announcement<Icon name="arrowright" className="w-4 h-4" /></a> : <p className="small-note">Original announcement link not provided.</p>}
          {c.organizerProfileUrl && <a className="inline-link" href={c.organizerProfileUrl} target="_blank" rel="noopener noreferrer">View Organizer Profile<Icon name="arrowright" className="w-4 h-4" /></a>}
          <Link className="inline-link" to={'/help?topic=listing&url=' + encodeURIComponent(window.location.origin + '/competitions/' + c.id)}>Report a listing issue →</Link>
        </div><div className="sidebar-tip"><Icon name="shieldcheck" className="w-5 h-5" /><p>Read the full eligibility requirements before registering for any competition.</p></div></aside>
      </div>
    </>;
  }
  function JobFairsPage() { return <FairUI.Directory/>; }
  function JobFairDetails({id}) { return <FairUI.Detail id={id}/>; }
  const DRAFT_KEY = 'talentsphere-competition-draft';
  function SubmitCompetitionPage({ embedded = false }) {
    const [values, setValues] = useState(() => {
      const saved = readStored(DRAFT_KEY, {});
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    });
    const [errors, setErrors] = useState({}), [notice, setNotice] = useState(''), [storageError, setStorageError] = useState(false);
    const [stage, setStage] = useState('edit');
    const field = (name, label, extra = {}) => <Field name={name} label={label} value={values[name] || ''} error={errors[name]} onChange={e => {
      setValues(v => ({ ...v, [name]: e.target.value })); setErrors(x => ({ ...x, [name]: '' })); setNotice('');
    }} {...extra} />;
    function saveDraft() {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values)); setStorageError(false); setNotice('Draft saved on this device. You can return to it later.'); }
      catch { setStorageError(true); setNotice('Your browser could not save the draft. Keep this page open to retain your changes.'); }
    }
    function review(e) {
      e.preventDefault(); const invalid = formErrors(e.currentTarget);
      if ((values.description || '').trim().length < 40) invalid.description = 'Describe your competition in at least 40 characters.';
      if (values.deadline && values.startDate && values.deadline > values.startDate) invalid.deadline = 'Registration must close on or before the event starts.';
      if (Object.keys(invalid).length) { setErrors(invalid); focusError(e.currentTarget, invalid); return; }
      setStage('review'); setNotice(''); window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function finish() {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values)); setStorageError(false); setStage('complete'); }
      catch { setStorageError(true); setNotice('Unable to save this preview on your device. Please enable browser storage and try again.'); }
    }
    return <>{!embedded && <PageHeader eyebrow="FOR THE COMMUNITY BUILDERS" title="Big ideas deserve" accent="a great stage." description="Bring your competition to Talent Square. Give the next generation of talent a challenge to remember." icon="rocket" />}
      <div className={embedded ? 'embedded-submission detail-layout' : 'page-container detail-layout'}><div className="detail-main">
        <div className="submission-steps">{['Competition details', 'Review your event', 'Preview complete'].map((s, i) => <div key={s} className={['edit','review','complete'].indexOf(stage) >= i ? 'active' : ''}><span>{i + 1}</span>{s}</div>)}</div>
        {stage === 'edit' && <form onSubmit={review} noValidate className="page-form">
          <Panel title="The essentials" icon="rocket"><p className="section-intro">Make a strong first impression. Tell participants what you are creating.</p>
            {field('title', 'Competition title', { placeholder: 'e.g. NextGen Innovation Hackathon 2026', maxLength: 140 })}
            <div className="form-grid">{field('organizer', 'Organizer / organization', { placeholder: 'Your club, company, or institution' })}
              {field('category', 'Category', { options: DATA.categories.filter(c => c.id !== 'all').map(c => ({ value: c.id, label: c.name })) })}</div>
            {field('description', 'About the competition', { type: 'textarea', placeholder: 'Describe the challenge, what participants will create, and what makes this event special.', hint: 'At least 40 characters. Include the challenge and expected outcome.' })}
          </Panel>
          <Panel title="When & where" icon="calendar"><div className="form-grid">{field('mode', 'Event format', { options: ['Online', 'On-site', 'Hybrid'] })}{field('location', 'Location or platform', { placeholder: 'e.g. Dhaka, Bangladesh or Online' })}
            {field('deadline', 'Registration deadline', { type: 'date' })}{field('startDate', 'Event start date', { type: 'date' })}</div></Panel>
          <Panel title="The participant experience" icon="users"><div className="form-grid">
            {field('prizePool', 'Prizes / rewards', { placeholder: 'e.g. ৳50,000 and certificates' })}
            {field('teamSize', 'Team size', { options: ['Individual', '1–2 members', '2–4 members', '3–5 members', 'Open team size'] })}</div>
            {field('eligibility', 'Who can participate?', { placeholder: 'e.g. University students from all disciplines' })}
            {field('website', 'Competition website', { type: 'url', required: false, placeholder: 'https://your-event.com' })}
          </Panel>
          {notice && <Notice error={storageError}>{notice}</Notice>}
          <div className="form-actions"><button type="button" className="button-secondary" onClick={saveDraft}>Save draft</button><button className="button-primary" type="submit">Review competition<Icon name="arrowright" className="w-4 h-4" /></button></div>
        </form>}
        {stage === 'review' && <Panel title="One last look" icon="eye"><span className="eyebrow">{DATA.categories.find(c => c.id === values.category)?.name}</span><h3 className="review-title">{values.title}</h3><p>{values.description}</p>
          <dl className="review-grid">{[['Organizer','organizer'],['Format','mode'],['Location','location'],['Registration deadline','deadline'],['Start date','startDate'],['Prizes','prizePool'],['Team size','teamSize'],['Eligibility','eligibility'],['Website','website']].map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{values[key] || 'Not provided'}</dd></div>)}</dl>
          <p className="preview-notice">This frontend preview saves the event on this device. It will not publish an event or send it for approval.</p>
          {notice && <Notice error={storageError}>{notice}</Notice>}<div className="form-actions"><button className="button-secondary" onClick={() => setStage('edit')}>Edit details</button><button className="button-primary" onClick={finish}>Save event preview<Icon name="checkcircle2" className="w-4 h-4" /></button></div>
        </Panel>}
        {stage === 'complete' && <div className="completion-card content-panel"><div className="completion-icon"><Icon name="checkcircle2" className="w-10 h-10" /></div><span className="eyebrow">ONE STEP CLOSER</span><h2>Your competition preview is ready.</h2>
          <p><strong>{values.title}</strong> has been saved on this device. Publishing and organizer approval will be available after the backend is connected.</p>
          <div className="form-actions"><button className="button-secondary" onClick={() => setStage('edit')}>Continue editing</button><Link className="button-primary" to="/competitions">Explore competitions</Link></div>
          <button className="inline-link" onClick={() => {
            try { localStorage.removeItem(DRAFT_KEY); setValues({}); setStage('edit'); setNotice(''); }
            catch { setStorageError(true); setNotice('Your browser could not clear the saved draft.'); }
          }}>Start a new competition</button>{notice && <Notice error={storageError}>{notice}</Notice>}</div>}
      </div><aside className="detail-sidebar"><div className="registration-card"><span className="eyebrow">MAKE IT STAND OUT</span><h2>Great challenges<br /><span className="gradient-text-hero">start with clarity.</span></h2>
        <ul className="check-list"><li>Give your event a clear, memorable title.</li><li>Explain who can join and what they will build.</li><li>Set clear dates and participation rules.</li><li>Describe your prizes and judging process.</li></ul>
      </div><div className="sidebar-tip"><Icon name="info" className="w-5 h-5" /><p>Drafts are stored in this browser. No event will be published from this frontend preview.</p></div></aside></div>
    </>;
  }
  function RankingsPage() {
    return <><PageHeader title="Let your talent" accent="do the talking." eyebrow="THE LEADERBOARD" description="Celebrating the builders, problem-solvers, and institutions raising the bar." icon="trendingup" />
      <div className="page-container podium-grid">{DATA.rankings.topTalent.slice(0, 3).map((p, i) => <article className={'podium-card podium-' + i} key={p.handle}><span className="podium-place">0{i + 1}</span><div className="podium-avatar">{p.name.split(' ').map(n => n[0]).join('')}</div><span className="eyebrow">{i === 0 ? 'LEADING THE WAY' : i === 1 ? 'RAISING THE BAR' : 'MAKING THEIR MARK'}</span><h2>{p.name}</h2><p>{p.institution}</p><strong>{p.points.toLocaleString()} <span>points</span></strong></article>)}</div>
      <RankingsSection /><div className="page-container ranking-explainer"><Panel title="Achievements behind the numbers" icon="shieldcheck"><p>These sample standings illustrate how competition achievements and institution rankings will appear. The final scoring formula and verified results will be connected in a later phase.</p></Panel></div>
    </>;
  }
  function NotFound() {
    return <div className="not-found page-container"><span className="gradient-text-hero">404</span><h1>This page is outside the sphere.</h1><p>The link may be incorrect, or the event is no longer available.</p><Link className="button-primary" to="/">Back to home<Icon name="arrowright" className="w-4 h-4" /></Link></div>;
  }
  const helpQuestions = [
    { group: 'Competitions', question: 'How do I join a competition?', answer: 'Open Explore competitions, use search or a category filter, then read the event details. Check eligibility, team size, dates, and the original organizer instructions. The current Join action opens a signup preview; it does not register you for an event.' },
    { group: 'Competitions', question: 'How do I submit my own competition?', answer: 'Sign in with an Organizer account, open My Competitions, then choose Create competition. You can save a draft or submit complete event details for administrator review. Pending and rejected submissions remain private; only a published listing appears in Explore. University and outside-university hosts are supported.' },
    { group: 'Competitions', question: 'What should I do if a deadline or event detail is incorrect?', answer: 'Check the original announcement first. Use the Competition correction topic below to prepare a report with the listing link, the incorrect detail, and the corrected information. Support delivery is not enabled in this preview.' },
    { group: 'Imports', question: 'Are competitions being imported automatically?', answer: 'The live importer checks the official Codeforces API, AtCoder upcoming and daily contest schedule, and Major League Hacking student hackathon schedule. New AtCoder and MLH sources use staff review by default. Enabled sources refresh on their configured intervals while the backend worker runs. Source changes require review before public updates. Admin Live imports shows real runs and candidates; older Simulate check controls remain demonstrations. Selected Bangladesh university sources (BUET CSE, UIU, NSU ECE and DIU) are checked every six hours while the worker runs. University announcements require confirmed details and staff approval; publication dates are never treated as event dates. This does not cover every university or Facebook-only announcement. Facebook is not connected.' },
    { group: 'Imports', question: 'Will an imported competition be verified automatically?', answer: 'An imported listing is not a verified endorsement. The connectors check required source fields and duplicate event links; unavailable deadlines, eligibility, prizes, and fees stay unknown. MLH is a listing source, and host or university affiliation remains unknown unless established separately. Trusted-source auto-publication can be enabled by staff with competition-review permissions. Always confirm registration instructions with the organizer.' },
    { group: 'Accounts', question: 'Why can I choose different workspace roles?', answer: 'The role selector changes the workspace view but does not change your Django account role or grant access to protected backend operations. Competition submission requires an authenticated Organizer account. Django Admin is separate and requires an administrator account.' },
    { group: 'Accounts', question: 'Can I create an account or reset my password now?', answer: 'Registration and email/password login use the local Django backend. Password recovery supports expiring reset links. This local setup saves messages in a private email outbox; inbox delivery needs an SMTP provider. Registration profiles are private by default, and login uses a Django session cookie rather than localStorage.' },
    { group: 'Accounts', question: 'Where are my drafts, profile changes, and saved events?', answer: 'Your saved account profile is read from Django and is currently read-only in the workspace. Organizer competition drafts and submissions are saved to Django and linked to your account. Older browser-only competition drafts may remain in local storage; other sample profile edits, preferences, and saved events stay in this browser and do not update your account or follow you to another device.' },
    { group: 'Careers', question: 'Does signing up book an interview or apply for a job?', answer: 'No. Published job fairs support saved items and internal attendance registration through Django, or links to official external registration. A registration records interest or planned attendance, not verified attendance, an interview or a job application. Job applications, recruitment and hiring remain previews.' },
    { group: 'Careers', question: 'How are rankings calculated?', answer: 'The current leaderboard uses sample data. Organizer results and admin result review can be explored locally, but they do not change public ranking points. A published scoring policy and verified results are needed before live rankings.' }
  ];
  function HelpPage({ search }) {
    const params = new URLSearchParams(search);
    const [query, setQuery] = useState(''), [group, setGroup] = useState('All topics');
    const [values, setValues] = useState({ name: '', email: '', topic: params.get('topic') === 'listing' ? 'Competition correction' : params.get('topic') === 'privacy' ? 'Account & privacy' : 'General question', url: params.get('url') || '', message: '' });
    const [errors, setErrors] = useState({}), [draft, setDraft] = useState(''), [downloadUrl, setDownloadUrl] = useState('');
    useEffect(() => {
      if (!draft) { setDownloadUrl(''); return; }
      const url = URL.createObjectURL(new Blob([draft], { type: 'text/plain;charset=utf-8' }));
      setDownloadUrl(url); return () => URL.revokeObjectURL(url);
    }, [draft]);
    const questions = helpQuestions.filter(q => (group === 'All topics' || q.group === group) && (q.question + ' ' + q.answer).toLowerCase().includes(query.trim().toLowerCase()));
    const field = (name, label, props = {}) => <Field name={'help-' + name} label={label} value={values[name]} error={errors['help-' + name]}
      onChange={e => { setValues(v => ({ ...v, [name]: e.target.value })); setErrors(x => ({ ...x, ['help-' + name]: '' })); setDraft(''); }} {...props} />;
    return <><PageHeader eyebrow="A LITTLE GUIDANCE GOES A LONG WAY" title="How can we" accent="help you?" description="Find a quick answer, understand how things work, or prepare a message for the Talent Square team." icon="info" />
      <div className="page-container help-layout"><div className="help-main">
        <section aria-labelledby="help-faq-heading"><h2 id="help-faq-heading" className="support-heading">Good questions. Clear answers.</h2>
          <div className="search-box"><Icon name="search" className="w-5 h-5" /><input aria-label="Search help" placeholder="Search competitions, accounts, imports…" value={query} onChange={e => setQuery(e.target.value)} /></div>
          <div className="support-topic-pills" aria-label="Help topics">{['All topics','Competitions','Accounts','Imports','Careers'].map(g =>
            <button key={g} aria-pressed={group === g} className={group === g ? 'active' : ''} onClick={() => setGroup(g)}>{g}</button>)}</div>
          <p className="help-result-count" aria-live="polite">{questions.length} answers</p>
          <div className="faq-list">{questions.map(q => <details key={q.question}><summary>{q.question}<span aria-hidden="true">+</span></summary><p>{q.answer}</p></details>)}</div>
          {!questions.length && <EmptyState title="No matching answers yet" text="Try another phrase, or prepare a question using the form." onReset={() => { setQuery(''); setGroup('All topics'); }} />}
        </section>
        <div className="support-quick-links"><Link to="/competitions"><Icon name="trophy" className="w-5 h-5" /><div><strong>Find your next challenge</strong><span>Explore competitions →</span></div></Link><Link to="/workspace"><Icon name="layoutgrid" className="w-5 h-5" /><div><strong>Make yourself at home</strong><span>Open your workspace →</span></div></Link></div>
      </div><aside className="help-contact"><Panel title="Let's make things clearer" icon="code2"><p className="section-intro">Ask a question or report a listing. This form prepares a downloadable message; it does not send it.</p>
        <form className="page-form" noValidate onSubmit={e => {
          e.preventDefault(); const invalid = formErrors(e.currentTarget);
          if (values.message.trim().length < 20) invalid['help-message'] = 'Please describe your question in at least 20 characters.';
          if (values.topic === 'Competition correction' && !values.url.trim()) invalid['help-url'] = 'Include the listing link so it can be identified.';
          if (Object.keys(invalid).length) { setErrors(invalid); focusError(e.currentTarget, invalid); return; }
          setErrors({}); setDraft(['Talent Square support draft', 'Topic: ' + values.topic, 'Name: ' + values.name.trim(), 'Reply email: ' + values.email.trim(), values.url ? 'Related page: ' + values.url.trim() : '', '', values.message.trim(), '', 'Prepared in a frontend preview. This message has not been sent.'].filter((line,i) => line || i >= 5).join('\n'));
        }}>
          {field('name','Your name',{ autoComplete:'name',maxLength:100,placeholder:'Your name' })}
          {field('email','Reply email',{ type:'email',autoComplete:'email',placeholder:'you@example.com' })}
          {field('topic','What is it about?',{ options:['General question','Competition correction','Organizer support','Account & privacy','Career opportunities','Accessibility issue'] })}
          {field('url','Related page link',{ type:'url',required:values.topic==='Competition correction',placeholder:'https://…' })}
          {field('message','Your message',{ type:'textarea',maxLength:4000,placeholder:'Tell us what happened and what would help.',hint:'Please leave out passwords, access tokens, and sensitive documents.' })}
          <button type="submit" className="button-primary full-width">Prepare message <Icon name="arrowright" className="w-4 h-4" /></button>
          {draft && <Notice>Your message draft is ready. Nothing has been sent.{downloadUrl && <a className="inline-link" href={downloadUrl} download="talentsphere-support-draft.txt">Download your message <Icon name="arrowright" className="w-4 h-4" /></a>}</Notice>}
        </form><p className="small-note">No support inbox is connected yet. Your message stays in this page's memory unless you download it.</p>
      </Panel><div className="sidebar-tip"><Icon name="shieldcheck" className="w-5 h-5" /><p>Looking for information about your data?<br /><Link to="/privacy">Read the privacy policy →</Link></p></div></aside></div>
    </>;
  }
  const policyContent = {
    privacy: {
      title: 'Your privacy.', accent: 'Clearly explained.', eyebrow: 'PRIVACY POLICY', icon: 'shieldcheck',
      description: 'What the local Talent Square frontend and account backend store, and what stays on your device.',
      intro: 'This notice describes the local frontend and Django account backend. The service operator, hosting arrangements, retention periods, and account deletion process must be documented before a public launch.',
      sections: [
        { id:'preview', title:'The current service and preview', paragraphs:['Competition discovery and organizer competition submissions use the local Django backend. Authenticated Organizers can save drafts or submit listings for administrator review; only published listings appear in public Explore. Internal registration, bookmarks and Participant activity use Django. External registrations are self-reported and unverified; job fairs, rankings, applications, hiring and older admin tabs remain demonstrations.'] },
        { id:'storage', title:'Information stored in your browser', paragraphs:['Workspace sample activity, preview profile edits, preferences, saved events, and simulated import history are stored using this site’s localStorage. These preview copies remain in the browser where you make the changes; they are not synchronized with a Talent Square account or another device. Signed-in account profile details are read from the local Django backend and are not overridden by preview profile data. Profile details and optional photos can be edited in My workspace. Profiles stay private unless the owner makes them public; email and phone sharing require separate choices.','The current browser storage keys include talentsphere-saved and talentsphere-workspaces-v1. An older talentsphere-competition-draft key may remain in a browser profile, but Django-backed organizer submissions do not read it. Data can remain until you remove it or clear the site’s browser storage. Anyone using the same browser profile may be able to view local preview content.'] },
        { id:'forms', title:'Forms and passwords', paragraphs:['Registration and login send account details to the local Django API on port 8001. Django stores passwords as hashes and uses an HTTP-only session cookie for login; the frontend does not save passwords or authentication state in localStorage. Role-specific profile fields are saved in SQLite and are private by default. Password recovery supports expiring reset links. This local setup saves messages in a private email outbox; inbox delivery needs an SMTP provider.','This configuration is for local development. A public deployment needs HTTPS, a private production secret key, secure cookies, and deployment security settings. The Help & Contact form keeps its draft in page memory and can create a text file when you choose Download; it does not send a support message.'] },
        { id:'third-parties', title:'Third-party resources and external links', paragraphs:['This preview loads React, Babel, Tailwind, icons, and fonts from third-party content delivery services, including unpkg.com, cdn.tailwindcss.com, and Google Fonts. Loading those resources sends ordinary web requests to those providers, which may receive technical information such as your IP address and browser details.','Opening an external organizer, registration, company, or source link takes you to another service. That service’s own privacy practices apply there. Review the destination before providing personal information.'] },
        { id:'visibility', title:'Profiles and sample visibility controls', paragraphs:['Registration profiles are stored in SQLite and are private by default. A signed-in member can view their own saved profile in the workspace; profile editing and public profile browsing are not connected. The preview profile editor changes only local sample data, and its visibility control does not publish the registered profile.'] },
        { id:'imports', title:'Imported competition information', paragraphs:['The Live imports tools store approved-source configurations, import candidates, review decisions, and run history in the Django database. Live connectors read the official Codeforces API, AtCoder contest schedule, Major League Hacking season schedule, and configured official pages from BUET CSE, UIU, NSU ECE and DIU. They retain event metadata and original links, without copying full announcements or fetching organizer websites. It retains source links and last-check times. Older preview controls are still local demonstrations.','Future collection should use approved sources and retain the announcement’s origin. Source authorization, the information collected, correction requests, and any retention rules must be documented before a live importer is enabled.'] },
        { id:'choices', title:'Your choices and local data removal', paragraphs:['You can edit preview profiles, update preferences, remove saved events, and replace a competition draft through the workspace controls. To remove local preview data, clear this site’s storage using your browser’s site-data settings. Account deletion is not available in the local account API yet.','Clearing browser storage removes local drafts and preview changes. It does not delete a Django account from SQLite; an administrator can manage local accounts through Django Admin.'] },
        { id:'questions', title:'Questions, corrections, and future updates', paragraphs:['Use Help & Contact to prepare a privacy question or a correction request. Delivery is not connected in this preview, so preparing or downloading a message is not a submitted request.','This notice should be updated as the implementation changes. The current preview does not define the operator, jurisdiction-specific rights process, or live account-deletion workflow. Those details belong in the launch version.'] }
      ]
    },
    terms: {
      title: 'A thoughtful community.', accent: 'Shared expectations.', eyebrow: 'TERMS OF USE', icon: 'checkcircle2',
      description: 'A clear starting point for participants, organizers, recruiters, and the people behind the platform.',
      intro: 'These are draft terms for the local frontend and account backend. Service-operator details, applicable law, hosting, retention, and working contact procedures must be finalized before a public launch.',
      sections: [
        { id:'scope', title:'What Talent Square currently provides', paragraphs:['Accounts, competition discovery and participation use Django. Organizers can submit competitions and job fairs for staff review; only published records are public. Participants can save published job fairs and register interest or attendance internally where available. External links do not confirm registration. Attendance registration is not verified attendance, an interview or a job application. Rankings, recruitment and job applications remain previews.'] },
        { id:'participation', title:'Participating responsibly', paragraphs:['Use accurate information when trying the forms. Do not use the platform to impersonate another person or organization, distribute harmful content, mislead participants, or present someone else’s work as your own.','For a real competition, check the organizer’s eligibility, deadlines, team rules, submission instructions, and terms before participating. Public listings contain organizer-provided event details approved for publication; check the original announcement for current rules and instructions.'] },
        { id:'organizers', title:'Organizer responsibilities', paragraphs:['An organizer should have authority to represent the organization and provide accurate event details. Announcements should clearly describe eligibility, dates, fees, prizes, judging, contact arrangements, and registration steps. Listings remain private until an administrator approves them in Django Admin.','Changes, postponements, and cancellations should be communicated clearly. A draft or pending submission is not a public listing; check My Competitions for its current review status.'] },
        { id:'recruiters', title:'Recruiter responsibilities', paragraphs:['Opportunities should accurately describe the company, role, work arrangement, required skills, and application process. Do not present a sample role, shortlist, or interview status as a real offer or hiring decision.','Handle applicant information with care and use it only for an appropriate recruitment purpose. The current recruiter workspace does not contact candidates or transfer an application to an employer.'] },
        { id:'sources', title:'External listings and automatic imports', paragraphs:['Imported content should retain the original source and be checked for accuracy, missing information, and duplicates. An import label is not an endorsement or a guarantee that an organizer, event, prize, or opportunity is verified.','The Live imports section uses the official Codeforces API, AtCoder schedule and Major League Hacking schedule. New AtCoder and MLH sources default to review before publication; staff can enable automatic publication. Changes to existing published entries require review. University announcements from configured BUET CSE, UIU, NSU ECE and DIU pages require staff verification. The university publishing a notice is not necessarily the event host. Facebook and other unimplemented connectors remain unavailable. Confirm registration and material event details with the original organizer.'] },
        { id:'ownership', title:'Content and attribution', paragraphs:['Only submit text, links, images, and other materials you are entitled to provide. Respect the work of participants, organizers, companies, and source publishers, and give appropriate attribution.','The current preview does not establish a live content-license agreement or transfer ownership of your work. Any permissions required for hosting, displaying, or distributing user content must be defined before those features launch.'] },
        { id:'results', title:'Results, rankings, and availability', paragraphs:['Public rankings and event statistics currently use sample data. Locally submitted or approved results do not change the public sample leaderboard. A final scoring policy and a verification process are needed before live results are published.','Dates, availability, and registration instructions can change on external sites. Check the original announcement before making travel plans, payments, or other commitments. The current preview does not process payments or guarantee a prize, interview, job, or event place.'] },
        { id:'moderation', title:'Corrections and moderation', paragraphs:['Competition submissions are reviewed in Django Admin. Administrators can publish complete submissions or reject them with a review reason; rejected records remain private unless resubmitted and approved. The Live imports section has staff-protected source and candidate controls. Older sample import tabs and account-status changes remain previews.','Use Help & Contact to prepare a report with a page link and enough detail to understand the issue. Reports are not delivered to a moderation team until a support service is connected.'] },
        { id:'updates', title:'Before the live service launches', paragraphs:['The launch terms should identify the operator, an actual contact channel, account and age requirements, moderation and appeal procedures, applicable law, and responsibilities appropriate to the final service. The privacy notice should describe the live data flows.','These pages are available to review without requiring acceptance or creating an account. Changes to this draft should be dated and explained when a live service is introduced.'] }
      ]
    }
  };
  function PolicyPage({ kind }) {
    const policy = policyContent[kind];
    return <><PageHeader {...policy} />
      <div className="page-container policy-layout"><aside className="policy-contents"><span className="eyebrow">ON THIS PAGE</span>
        <nav aria-label="Policy sections">{policy.sections.map((s,i) => <a href={'#' + kind + '-' + s.id} key={s.id}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a>)}</nav>
        <Link to={kind === 'privacy' ? '/terms' : '/privacy'} className="inline-link">{kind === 'privacy' ? 'Terms of use' : 'Privacy policy'} →</Link>
      </aside><article className="policy-body">
        <div className="policy-intro"><div className="policy-metadata"><BadgeLabel>Frontend preview draft</BadgeLabel><span>Updated 19 October 2026</span></div><p>{policy.intro}</p></div>
        {policy.sections.map((s,i) => <section className="policy-section" key={s.id} id={kind + '-' + s.id}><span className="policy-number">{String(i+1).padStart(2,'0')}</span><div><h2>{s.title}</h2>{s.paragraphs.map(p=><p key={p}>{p}</p>)}</div></section>)}
        <div className="policy-footer"><Icon name="info" className="w-5 h-5" /><div><h2>Clear information starts with a conversation.</h2><p>Find answers or prepare a question about this preview.</p><Link className="inline-link" to={'/help' + (kind === 'privacy' ? '?topic=privacy' : '')}>Help & contact →</Link></div></div>
      </article></div>
    </>;
  }
  function BadgeLabel({ children }) { return <span className="policy-draft-badge">{children}</span>; }
  function AccessDenied() {
    return <div className="system-state page-container"><div className="system-state-icon"><Icon name="shieldcheck" className="w-10 h-10" /></div><span className="eyebrow">ACCESS RESTRICTED</span><h1>This space needs the right access.</h1><p>In the live service, this view will appear when an account does not have permission for a protected area. This is a frontend state preview; account permissions are not connected yet.</p><div className="form-actions"><Link className="button-primary" to="/login">Go to login</Link><Link className="button-secondary" to="/workspace">Workspace preview</Link></div><Link className="inline-link" to="/help">Need a hand? Visit Help →</Link></div>;
  }
  function LoadingState() {
    return <div className="system-state page-container"><div className="loading-ring" aria-hidden="true" /><div role="status" aria-live="polite"><span className="eyebrow">LOADING PREVIEW</span><h1>Getting your sphere ready.</h1><p>This reusable state shows how content will appear while a live service is loading.</p></div><div className="loading-skeletons" aria-hidden="true">{[1,2,3].map(i=><div key={i}><span/><span/><span/></div>)}</div><Link className="button-secondary" to="/">Return to home</Link></div>;
  }
  function datetimeLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  function FacebookPostSuggestion() {
    const [form,setForm]=useState({post_url:'',title:'',notes:''}),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false);
    async function submit(e){e.preventDefault();setBusy(true);setMessage('');try{const data=await requestApi('/discovery/facebook/suggest/',{method:'POST',body:form});setMessage(data.detail);setError(false);setForm({post_url:'',title:'',notes:''});}catch(e){setError(true);setMessage(Object.entries(e.data||{}).map(([k,v])=>(k==='detail'?'':k+': ')+(Array.isArray(v)?v.join(' '):v)).join(' · ')||e.message);}finally{setBusy(false);}}
    return <Panel title="Found a competition on Facebook?" icon="rocket">
      <p className="work-item-copy">Suggest its post link for staff review. You do not need to manage the Page. This form does not automatically read the post.</p>
      {message&&<Notice error={error}>{message}</Notice>}
      <form className="page-form" onSubmit={submit}>
        <Field name="post_url" label="Facebook post link" type="url" required maxLength={1000} value={form.post_url} onChange={e=>setForm({...form,post_url:e.target.value})}/>
        <Field name="facebook_title" label="Competition title" required minLength={10} maxLength={180} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <Field name="facebook_notes" label="Details for the reviewer (optional)" type="textarea" required={false} maxLength={5000} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
        <button type="submit" className="button-secondary" disabled={busy}>{busy?'Sending…':'Send Facebook link for review'}</button>
      </form>
    </Panel>;
  }

  function RealSubmitCompetitionPage({ embedded = false, accountState, account, submission = null, onSaved, onCancel, navigate }) {
    const initialValues = () => ({
      title: submission?.title || '', description: submission?.description || '', host_organization: submission?.host_organization || '',
      host_type: submission?.host_type || '', university_name: submission?.university_name || '',
      institution_affiliation: submission?.institution_affiliation || '', competition_category: submission?.category || '',
      event_mode: submission?.mode || '', location: submission?.location || '', event_start_date: datetimeLocal(submission?.event_start_date),
      event_end_date: datetimeLocal(submission?.event_end_date), registration_deadline: datetimeLocal(submission?.registration_deadline),
      registration_url: submission?.registration_url || '', source_url: submission?.source_url || '', eligibility: submission?.eligibility || '',
      team_size: submission?.team_size || '', prize_pool: submission?.prize_pool || '',
      registration_fee: submission?.registration_fee ?? '', registration_fee_currency: submission?.registration_fee_currency || 'BDT',
      registration_mode: submission?.registration_mode || 'external',
      tags: Array.isArray(submission?.tags) ? submission.tags.join(', ') : ''
    });
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({}), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
    const [stage, setStage] = useState('edit'), [savedSubmission, setSavedSubmission] = useState(null);
    useEffect(() => { setValues(initialValues()); setErrors({}); setStage('edit'); setNotice(''); setSavedSubmission(null); }, [submission]);
    const isOrganizer = accountState?.status === 'loaded' && account?.authenticated && account?.role === 'organizer';
    const field = (name, label, extra = {}) => <Field name={name} label={label} value={values[name] ?? ''} error={errors[name]} onChange={event => {
      setValues(current => ({ ...current, [name]: event.target.value })); setErrors(current => ({ ...current, [name]: '' })); setNotice('');
    }} {...extra} />;

    async function save(asDraft) {
      if (busy) return;
      setBusy(true); setErrors({}); setNotice('');
      const body = { ...values,
        event_start_date: values.event_start_date ? new Date(values.event_start_date).toISOString() : null,
        event_end_date: values.event_end_date ? new Date(values.event_end_date).toISOString() : null,
        registration_deadline: values.registration_deadline ? new Date(values.registration_deadline).toISOString() : null,
        registration_fee: values.registration_fee === '' ? null : values.registration_fee,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      delete body.tagsText;
      if (submission) body.submit_for_review = !asDraft;
      else body.save_as_draft = asDraft;
      try {
        const result = await requestApi(submission ? `/organizer/competitions/${submission.id}/` : '/competitions/', {
          method: submission ? 'PATCH' : 'POST', body
        });
        setSavedSubmission(result);
        setNotice(asDraft ? 'The draft was saved to your Django account.' : 'The submission is now Pending Review in Django.');
        setStage('complete');
        onSaved?.(result);
      } catch (error) {
        const apiErrors = {};
        Object.entries(error.data || {}).forEach(([key, messages]) => {
          if (key !== 'detail' && key !== 'non_field_errors') apiErrors[key] = Array.isArray(messages) ? messages.join(' ') : String(messages);
        });
        setErrors(apiErrors);
        setNotice(error.data?.detail || error.message || 'The competition could not be saved.');
      } finally { setBusy(false); }
    }

    if (accountState?.status === 'loading' || !accountState) return <Panel title="Checking Organizer session" icon="clock"><p>Verifying your Django account…</p></Panel>;
    if (accountState.status === 'error') return <Panel title="Organizer account unavailable" icon="info"><Notice error>The Django account service could not be reached. Reload after the backend is available.</Notice></Panel>;
    if (!isOrganizer) return <Panel title="Organizer sign-in required" icon="shieldcheck"><p>Only a signed-in Organizer can submit and manage competitions.</p><div className="form-actions"><Link className="button-primary" to={'/login?next=' + encodeURIComponent('/workspace?role=organizer&tab=create')}>Sign in</Link><Link className="button-secondary" to="/signup?role=organizer">Create Organizer account</Link></div></Panel>;

    const categoryOptions = DATA.categories.filter(item => item.id !== 'all').map(item => ({ value: item.id, label: item.name }));
    return <>{!embedded && <PageHeader eyebrow="FOR THE COMMUNITY BUILDERS" title="Big ideas deserve" accent="a great stage." description="Submit a CSE competition for administrator review. It stays private until approved." icon="rocket" />}
      <div className={embedded ? 'embedded-submission detail-layout' : 'page-container detail-layout'}><div className="detail-main">
        {!submission&&<FacebookPostSuggestion/>}
        <div className="submission-steps">{['Competition details', 'Review your event', 'Saved to Django'].map((label, index) => <div key={label} className={['edit','review','complete'].indexOf(stage) >= index ? 'active' : ''}><span>{index + 1}</span>{label}</div>)}</div>
        {stage === 'edit' && <form className="page-form" noValidate onSubmit={event => {
          event.preventDefault(); const invalid = formErrors(event.currentTarget);
          if ((values.description || '').trim().length < 40) invalid.description = 'Describe the competition in at least 40 characters.';
          if (values.event_end_date && values.event_start_date && values.event_end_date < values.event_start_date) invalid.event_end_date = 'Event end must be on or after its start.';
          if (values.registration_deadline && values.event_start_date && values.registration_deadline > values.event_start_date) invalid.registration_deadline = 'Registration must close on or before the event starts.';
          if (Object.keys(invalid).length) { setErrors(invalid); focusError(event.currentTarget, invalid); return; }
          setStage('review'); setNotice('');
        }}>
          <Panel title="Competition details" icon="rocket"><div className="form-grid">
            {field('title', 'Competition title', { maxLength: 180, placeholder: 'e.g. National CSE Innovation Hackathon' })}
            {field('competition_category', 'CSE category', { options: categoryOptions })}
          </div>
            {field('description', 'Description', { type: 'textarea', minLength: 40, hint: 'At least 40 characters. Explain the challenge and what participants will do.' })}
            <div className="form-grid">{field('host_type', 'Host type', { options: [{ value: 'university', label: 'University-hosted' }, { value: 'outside_university', label: 'Outside-university / independent' }] })}
              {field('host_organization', 'Host organization', { placeholder: 'Department, club, company, or community' })}</div>
            <div className="form-grid">{values.host_type === 'university' && field('university_name', 'Hosting university', { placeholder: 'University name' })}
              {field('institution_affiliation', 'Institution affiliation (optional)', { required: false, placeholder: 'Partner institution, if any' })}</div>
          </Panel>
          <Panel title="Dates and format" icon="calendar"><div className="form-grid">
            {field('event_mode', 'Event format', { options: [{ value: 'online', label: 'Online' }, { value: 'in_person', label: 'On-site' }, { value: 'hybrid', label: 'Hybrid' }] })}
            {field('location', 'Location or platform', { placeholder: 'e.g. Dhaka, Bangladesh or Online' })}
            {field('registration_deadline', 'Registration deadline', { type: 'datetime-local' })}
            {field('event_start_date', 'Event start date and time', { type: 'datetime-local' })}
            {field('event_end_date', 'Event end date and time (optional)', { type: 'datetime-local', required: false })}
          </div></Panel>
          <Panel title="Eligibility and official links" icon="users">
            {field('eligibility', 'Who can participate?', { type: 'textarea', placeholder: 'Explain eligibility requirements.' })}
            <div className="form-grid">{field('registration_mode', 'Registration mode', { options: [{value:'external',label:'External official website'},{value:'internal',label:'Register on Talent Square'}], hint:'Internal registration is enabled only after administrator publication approval.' })}{field('registration_url', 'Official registration URL', { type: 'url', required: values.registration_mode !== 'internal', placeholder: 'https://...' })}
              {field('source_url', 'Announcement / source URL (optional)', { type: 'url', required: false, placeholder: 'https://...' })}</div>
            <div className="form-grid">{field('team_size', 'Team size (optional)', { required: false, placeholder: 'e.g. 2–4 members' })}
              {field('prize_pool', 'Prize pool (optional)', { required: false, placeholder: 'e.g. BDT 50,000 and certificates' })}</div>
            <div className="form-grid">{field('registration_fee', 'Fee amount (optional)', { type: 'number', required: false, min: 0, step: '0.01' })}
              {field('registration_fee_currency', 'Fee currency', { options: ['BDT', 'USD', 'EUR'] })}</div>
            {field('tags', 'Tags (optional)', { required: false, placeholder: 'Python, AI, beginner friendly', hint: 'Separate tags with commas.' })}
          </Panel>
          {notice && <Notice error>{notice}</Notice>}
          <div className="form-actions"><button type="button" className="button-secondary" disabled={busy} onClick={() => save(true)}>{busy ? 'Saving…' : 'Save as draft'}</button>
            <button type="submit" className="button-primary" disabled={busy}>Review submission<Icon name="arrowright" className="w-4 h-4" /></button>
            {onCancel && <button type="button" className="work-text-button" onClick={onCancel}>Cancel</button>}</div>
        </form>}
        {stage === 'review' && <Panel title="Review your submission" icon="eye"><span className="eyebrow">{DATA.categories.find(item => item.id === values.competition_category)?.name}</span><h3 className="review-title">{values.title}</h3><p>{values.description}</p>
          <dl className="review-grid">{[['Host', 'host_organization'], ['Host type', 'host_type'], ['University', 'university_name'], ['Format', 'event_mode'], ['Location', 'location'], ['Registration deadline', 'registration_deadline'], ['Event start', 'event_start_date'], ['Event end', 'event_end_date'], ['Eligibility', 'eligibility'], ['Registration URL', 'registration_url'], ['Source URL', 'source_url']].map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{values[key] || 'Not provided'}</dd></div>)}</dl>
          <p className="preview-notice">Django will save this as Pending Review. It will stay out of public Explore until an administrator approves it.</p>
          {notice && <Notice error>{notice}</Notice>}<div className="form-actions"><button className="button-secondary" disabled={busy} onClick={() => setStage('edit')}>Edit details</button>
            <button className="button-primary" disabled={busy} onClick={() => save(false)}>{busy ? 'Submitting…' : 'Submit for review'}<Icon name="checkcircle2" className="w-4 h-4" /></button></div>
        </Panel>}
        {stage === 'complete' && <div className="completion-card content-panel"><div className="completion-icon"><Icon name="checkcircle2" className="w-10 h-10" /></div><span className="eyebrow">SAVED TO DJANGO</span><h2>{savedSubmission?.title}</h2><p>{notice}</p>
          <p><strong>Current status: {savedSubmission?.submission_status}</strong></p>{savedSubmission?.review_notes && <Notice error>Administrator note: {savedSubmission.review_notes}</Notice>}
          <div className="form-actions"><Link className="button-primary" to="/workspace?role=organizer&tab=competitions">Go to My Competitions</Link><Link className="button-secondary" to="/competitions">Explore published competitions</Link></div>
        </div>}
      </div><aside className="detail-sidebar"><div className="registration-card"><span className="eyebrow">MAKE IT STAND OUT</span><h2>Great challenges<br /><span className="gradient-text-hero">start with clarity.</span></h2>
        <ul className="check-list"><li>Identify the host separately from your organizer account.</li><li>Set the registration deadline and event times.</li><li>Only an administrator can approve public publication.</li></ul>
      </div><div className="sidebar-tip"><Icon name="shieldcheck" className="w-5 h-5" /><p>Drafts and submissions are saved to your Django account, not browser storage.</p></div></aside></div>
    </>;
  }
  function PublicProfilePage({profileId}) {
    const [state,setState]=useState({status:'loading'});
    useEffect(()=>{let active=true;requestApi('/profiles/'+profileId+'/').then(data=>{if(active)setState({status:'ready',data});}).catch(()=>{if(active)setState({status:'unavailable'});});return()=>{active=false;};},[profileId]);
    if(state.status==='loading')return <div className="page-container"><Panel title="Loading profile"><p>Getting this profile…</p></Panel></div>;
    if(state.status!=='ready')return <div className="page-container"><EmptyState title="Profile unavailable" text="This profile is private or no longer available."/></div>;
    const {data}=state,p=data.profile||{};
    const imageUrl=value=>value?AUTH_API.replace(/\/api$/,'')+value:'';
    const labels={full_name:'Name',current_status:'Current status',institution_name:'Institution',department:'Department',graduation_year:'Graduation year',bio:'About',skills:'Skills',education_info:'Education',work_experience:'Experience',achievements:'Competition achievements (self-reported)',codeforces_handle:'Codeforces handle',atcoder_handle:'AtCoder handle',organization_name:'Organization',organizer_type:'Organizer type',contact_name:'Contact person',description:'About the organization',club_organization_name:'Club',recruiter_name:'Recruiter',company_name:'Company',recruiter_designation:'Job title',company_description:'About the company',hiring_interests:'Hiring interests',email:'Contact email',contact_phone:'Contact phone',github_url:'GitHub',linkedin_url:'LinkedIn',portfolio_url:'Portfolio',website_url:'Website',company_website:'Company website'};
    return <div className="page-container public-profile-page"><div className="profile-preview-card"><div className="profile-monogram">{p.photo_url?<img src={imageUrl(p.photo_url)} alt={data.role==='organizer'?'Organization logo':'Profile photo'}/>:data.display_name.split(/\s+/).slice(0,2).map(x=>x[0]).join('')}</div><div><span className="eyebrow">{data.role} PROFILE</span><h1>{data.display_name}</h1><p>{p.company_name||p.institution_name||'Talent Square community'}</p></div>{p.company_logo_url&&<img className="public-company-logo" src={imageUrl(p.company_logo_url)} alt="Company logo"/>}</div>
      <Panel title="Profile details" icon="user"><dl className="public-profile-fields">{Object.entries(labels).filter(([key])=>p[key]!==undefined&&p[key]!==''&&p[key]!==null&&(!Array.isArray(p[key])||p[key].length)).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{key.endsWith('_url')||key==='company_website'?<a className="inline-link" href={p[key]} target="_blank" rel="noopener noreferrer">{p[key]} ↗</a>:Array.isArray(p[key])?p[key].join(', '):String(p[key])}</dd></div>)}</dl></Panel>
      {!!data.competitions?.length&&<Panel title="Published competitions" icon="trophy">{data.competitions.map(c=><p key={c.id}><Link className="inline-link" to={'/competitions/'+c.id}>{c.title} →</Link></p>)}</Panel>}
    </div>;
  }

  function App() {
    const [location, setLocation] = useState(() => ({ path: window.location.pathname.replace(/\/$/, '') || '/', search: window.location.search }));
    useEffect(() => {
      const update = () => setLocation({ path: window.location.pathname.replace(/\/$/, '') || '/', search: window.location.search });
      window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update);
    }, []);
    const { path, search } = location;
    const competition = null;
    const fair = path.startsWith('/job-fairs/') ? {title:'Job fair'} : null;
    useEffect(() => {
      document.title = (path === '/login' && ['recovery','reset'].includes(new URLSearchParams(search).get('view')) ? 'Password recovery' :
        (path.startsWith('/profiles/')?'Community profile':titles[path]) || competition?.title || fair?.title || 'Page not found') + ' · Talent Square';
      window.scrollTo(0, 0);
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }, [path, search]);
    const callbacks = { onOpenAuth: view => navigate(authPath(view)), onOpenSubmit: () => navigate(SUBMIT_PATH), onNavigateSection: section => navigate(sectionPaths[section] || '/') };
    const selectContest = c => navigate('/competitions/' + c.id), selectFair = f => navigate('/job-fairs/' + f.id);
    let page;
    if (path === '/') page = <><HeroSection {...callbacks} /><ExploreCompetitionsSection onSelectContest={selectContest} /><FairUI.Home/><RankingsSection /></>;
    else if (path === '/login' && new URLSearchParams(search).get('view') === 'reset') page = <ResetPasswordPage key={search} search={search}/>;
    else if (['/login','/signup','/forgot-password'].includes(path)) page = <AuthPage key={path + (new URLSearchParams(search).get('view') || '')} mode={path === '/login' && new URLSearchParams(search).get('view') === 'recovery' ? 'forgot-password' : path.slice(1)} search={search} />;
    else if (path === '/competitions') page = <ExploreCompetitionsPage onSelectContest={selectContest} onOpenSubmit={callbacks.onOpenSubmit} />;
    else if (path.startsWith('/competitions/')) page = <CompetitionDetails key={path} competitionId={path.split('/').filter(Boolean).pop()} />;
    else if (path === '/job-fairs') page = <JobFairsPage onOpenAuth={callbacks.onOpenAuth} onSelectFair={selectFair} />;
    else if (path.startsWith('/job-fairs/')) page = <JobFairDetails key={path} id={path.split('/').filter(Boolean)[1]} />;
    else if (path === '/rankings') page = <RankingsPage />;
    else if (/^\/profiles\/\d+$/.test(path)) page = <PublicProfilePage key={path} profileId={path.split('/').pop()}/>;
    else if (path === '/workspace') page = <WorkspacePage search={search} />;
    else if (path === '/admin') page = <AdminPage search={search} />;
    else if (path === '/help') page = <HelpPage key={search} search={search} />;
    else if (path === '/privacy' || path === '/terms') page = <PolicyPage key={path} kind={path.slice(1)} />;
    else if (path === '/preview/access-denied') page = <AccessDenied />;
    else if (path === '/preview/loading') page = <LoadingState />;
    else if (path === '/organizer/competitions/new') page = <WorkspacePage search="?role=organizer&tab=create" />;
    else page = <NotFound />;
    return <><a className="skip-link" href="#main-content">Skip to content</a><Navbar key={path} currentPath={path} {...callbacks} />
      <main id="main-content" tabIndex={-1}>{page}</main><Footer {...callbacks} /></>;
  }
  const FairUI = window.TalentSquareJobFairUI = window.createTalentSquareJobFairs({Link,Panel,Notice,requestApi});
  const { WorkspacePage, AdminPage } = window.createTalentSphereWorkspaces({
    Icon, Link, Panel, Field, Notice, EmptyState, SubmitCompetitionPage: RealSubmitCompetitionPage, navigate, readStored, formErrors, focusError, requestApi
  });
  window.TalentSquareActivity = { BookmarkButton: ParticipantBookmarkButton };
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
