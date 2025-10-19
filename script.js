/* Shared site JS: navigation toggle, year update, menu filter, forms, reservation simulation */

document.addEventListener('DOMContentLoaded', () => {
  // Nav toggle for small screens
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if(navToggle){
    navToggle.addEventListener('click', () => {
      if(mainNav.style.display === 'flex') mainNav.style.display = '';
      else mainNav.style.display = 'flex';
      mainNav.style.flexDirection = 'column';
    });
  }

  // Set copyright year
  const years = document.querySelectorAll('#year, #year2, #year3');
  years.forEach(el => { if(el) el.textContent = new Date().getFullYear(); });

  // Newsletter simple handler
  const nl = document.getElementById('newsletterForm');
  if(nl){
    nl.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('nlEmail').value;
      alert('Thanks for subscribing: ' + email);
      nl.reset();
    });
  }

  // Contact form (client-side validation + simulated submission)
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if(!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
      // simulate send
      document.getElementById('contactSuccess').hidden = false;
      contactForm.reset();
    });
  }

  // Menu filter
  const dietFilter = document.getElementById('dietFilter');
  if(dietFilter){
    dietFilter.addEventListener('change', () => {
      const val = dietFilter.value;
      document.querySelectorAll('.menu-item').forEach(item => {
        const diet = item.getAttribute('data-diet') || 'all';
        if(val === 'all' || val === diet || (val==='veg' && diet==='veg') || (val==='vegan' && diet==='vegan') || (val==='gf' && diet==='gf')){
          item.style.display = '';
        } else item.style.display = 'none';
      });
    });
  }

  // Print menu button: opens print-friendly view (prints current page)
  const printMenu = document.getElementById('printMenu');
  if(printMenu){
    printMenu.addEventListener('click', () => { window.print(); });
  }

  // Reservation page: populate times, disable past dates, simulate booking
  const reservationForm = document.getElementById('reservationForm');
  if(reservationForm){
    const rdate = document.getElementById('rdate');
    const rtime = document.getElementById('rtime');

    // populate time slots (30-min intervals between 08:00 and 22:00)
    function populateTimes(){
      rtime.innerHTML = '';
      const start = 8*60; // 08:00
      const end = 22*60; // 22:00
      for(let t = start; t <= end; t += 30){
        const hours = Math.floor(t/60);
        const minutes = (t%60).toString().padStart(2,'0');
        const opt = document.createElement('option');
        opt.value = `${hours}:${minutes}`;
        opt.textContent = `${hours}:${minutes}`;
        rtime.appendChild(opt);
      }
    }
    populateTimes();

    // disable past dates by setting min attr to today
    function setMinDate(){
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth()+1).padStart(2,'0');
      const dd = String(today.getDate()).padStart(2,'0');
      rdate.min = `${yyyy}-${mm}-${dd}`;
    }
    setMinDate();

    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if(!reservationForm.checkValidity()) { reservationForm.reportValidity(); return; }
      // simulate availability check (always available here)
      const name = document.getElementById('rname').value;
      const email = document.getElementById('remail').value;
      const phone = document.getElementById('rphone').value;
      const date = document.getElementById('rdate').value;
      const time = document.getElementById('rtime').value;
      const guests = document.getElementById('rguests').value;
      const notes = document.getElementById('rnotes').value;

      const ref = generateRef();
      // Save to localStorage as a reservation record
      const record = {ref,name,email,phone,date,time,guests,notes,created: new Date().toISOString()};
      const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
      reservations.push(record);
      localStorage.setItem('reservations', JSON.stringify(reservations));

      // show success summary
      document.getElementById('reservationForm').hidden = true;
      const success = document.getElementById('reservationSuccess');
      document.getElementById('resSummary').textContent = `${name} — ${guests} guests on ${date} at ${time}`;
      document.getElementById('resRef').textContent = ref;
      success.hidden = false;

      // Add handler for calendar download
      document.getElementById('downloadIcs').onclick = () => {
        createICS({title: 'Reservation - The Urban Spoon', description: `Reservation ref: ${ref}`, startDate: date + 'T' + time.replace(':','') + '00'});
      };
      reservationForm.reset();
    });

    function generateRef(){
      const s = Math.random().toString(36).slice(2,8).toUpperCase();
      return 'UBN-' + s;
    }

    // create a minimal .ics and offer download
    function createICS({title,description,startDate}) {
      // startDate expected as YYYY-MM-DDTHHMMSS or similar
      // Create a 2-hour booking event
      const dtstart = startDate.replace(/[-:]/g,'') + '00';
      // fallback naive end time +2h
      const dtend = dtstart;
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//TheUrbanSpoon//EN',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@urbanspoon`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([ics], {type: 'text/calendar'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reservation.ics';
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); },1000);
    }
  } // reservation form

}); // DOMContentLoaded
