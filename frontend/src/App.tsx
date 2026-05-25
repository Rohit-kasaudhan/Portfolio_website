import React, { useState, useEffect } from 'react';
import profileImg from './assets/profile.png';
import attendxImg from './assets/attendx.png';
import researchQaImg from './assets/research_qa.png';
import nepseImg from './assets/nepse.png';
import emailSpamImg from './assets/email_spam_detection.png';
import AIPet from './components/AIPet';

function App() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // 1. Navigation Scrolled Background Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Mobile Menu Scroll Lock
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  // 3. Scroll Reveal Animations
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 4. Active Nav Section Highlight on Scroll
  useEffect(() => {
    const handleActiveNav = () => {
      const scrollY = window.scrollY;
      const nav = document.querySelector('nav') as HTMLElement | null;
      const navH = nav ? nav.offsetHeight : 0;
      const sections = document.querySelectorAll('section[id]');

      sections.forEach((section) => {
        const htmlSection = section as HTMLElement;
        const top = htmlSection.offsetTop - navH - 40;
        const bottom = top + htmlSection.offsetHeight;

        if (scrollY >= top && scrollY < bottom) {
          setActiveSection(htmlSection.id);
        }
      });
    };

    window.addEventListener('scroll', handleActiveNav, { passive: true });
    handleActiveNav();
    return () => window.removeEventListener('scroll', handleActiveNav);
  }, []);

  // 5. Stats Count-Up Animation
  useEffect(() => {
    function countUp(el: HTMLElement, target: number, duration: number = 1500) {
      let start = 0;
      const step = target / (duration / 16);
      const suffix = el.dataset.suffix || '';
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          el.textContent = target + suffix;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(start) + suffix;
        }
      }, 16);
    }

    function countUpFloat(el: HTMLElement, target: number, duration: number = 1500) {
      let start = 0;
      const step = target / (duration / 16);
      const suffix = el.dataset.suffix || '';
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          el.textContent = target.toFixed(2) + suffix;
          clearInterval(timer);
        } else {
          el.textContent = start.toFixed(2) + suffix;
        }
      }, 16);
    }

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const nums = entry.target.querySelectorAll('.stat .num, .acard-num');
            nums.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const text = htmlEl.textContent?.trim() || '';
              if (text.includes('.')) {
                const rawFloat = parseFloat(text);
                const suffix = text.replace(/[\d.]/g, '');
                htmlEl.dataset.suffix = suffix;
                countUpFloat(htmlEl, rawFloat, 1200);
              } else {
                const raw = text.replace(/\D/g, '');
                const suffix = text.replace(/[\d]/g, '');
                htmlEl.dataset.suffix = suffix;
                countUp(htmlEl, parseInt(raw, 10), 1200);
              }
            });
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    document.querySelectorAll('.hero-stats, .about-right').forEach((el) => {
      statsObserver.observe(el);
    });

    return () => statsObserver.disconnect();
  }, []);

  // 6. High-Performance Cursor Tracker (CSS Variables)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 7. 3D Card Tilt Effect on Hover
  useEffect(() => {
    const cards = document.querySelectorAll('.wcard, .svc-item');
    
    const handleMouseMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const box = card.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const xc = box.width / 2;
      const yc = box.height / 2;
      const angleX = (yc - y) / 10;
      const angleY = (x - xc) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'none';
      card.style.boxShadow = `0 15px 30px rgba(232, 98, 26, 0.08)`;
    };
    
    const handleMouseLeave = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
      card.style.boxShadow = 'none';
    };
    
    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove as EventListener);
      card.addEventListener('mouseleave', handleMouseLeave as EventListener);
    });
    
    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove as EventListener);
        card.removeEventListener('mouseleave', handleMouseLeave as EventListener);
      });
    };
  }, []);

  // 8. Smooth Scroll Handler with Navbar Offset
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMenuOpen(false); // Close mobile menu if open
    if (targetId === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(targetId) as HTMLElement | null;
    if (!target) return;
    const nav = document.querySelector('nav') as HTMLElement | null;
    const navHeight = nav ? nav.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <>
      {/* ── MOUSE CURSOR BACKGLOW AURA ── */}
      <div className="cursor-glow"></div>

      {/* ── MOBILE MENU ── */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="dialog" aria-label="Navigation">
        <a href="#about" className={activeSection === 'about' ? 'active' : ''} onClick={(e) => handleAnchorClick(e, '#about')}>About</a>
        <a href="#services" className={activeSection === 'services' ? 'active' : ''} onClick={(e) => handleAnchorClick(e, '#services')}>Services</a>
        <a href="#work" className={activeSection === 'work' ? 'active' : ''} onClick={(e) => handleAnchorClick(e, '#work')}>Work</a>
        <a href="#contact" className={activeSection === 'contact' ? 'active' : ''} onClick={(e) => handleAnchorClick(e, '#contact')}>Contact</a>
      </div>

      {/* ── NAV ── */}
      <nav className={scrolled ? 'scrolled' : ''}>
        <a className="nav-logo" href="#" onClick={(e) => handleAnchorClick(e, '#')}>Rohit<span>.</span></a>
        <ul className="nav-links">
          <li><a href="#about" className={activeSection === 'about' ? 'active' : ''} onClick={(e) => handleAnchorClick(e, '#about')}>About</a></li>
          <li><a href="#services" className={activeSection === 'services' ? 'active' : ''} onClick={(e) => handleAnchorClick(e, '#services')}>Services</a></li>
          <li><a href="#work" className={activeSection === 'work' ? 'active' : ''} onClick={(e) => handleAnchorClick(e, '#work')}>Work</a></li>
          <li><a href="#contact" className={`nav-cta ${activeSection === 'contact' ? 'active' : ''}`} onClick={(e) => handleAnchorClick(e, '#contact')}>Hire Me</a></li>
        </ul>
        <button className={`hamburger ${menuOpen ? 'open' : ''}`} aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-glow"></div>
        <div className="hero-left">
          <div className="hero-tag">AI/ML ENGINEER</div>
          <h1 className="hero-title">
            <span className="w">Hey,</span>
            <span className="o">I'm Rohit Kasaudhan</span>
            <span className="w"></span>
          </h1>
          <p className="hero-sub">AI/ML Developer &amp; Computer Science Student at KIIT</p>
          <div className="hero-btns">
            <a className="btn-primary" href="#work" onClick={(e) => handleAnchorClick(e, '#work')}>Explore Portfolio &#8594;</a>
            <a className="btn-ghost hero-btn-resume" href="https://drive.google.com/file/d/1DKam_WIf827Ise-tznI5jaURlvZ12QwY/view?usp=sharing" target="_blank" rel="noopener noreferrer">Resume</a>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="num">10+</div><div className="lbl">Projects Done</div></div>
            <div className="stat"><div className="num">3+</div><div className="lbl">Years Coding</div></div>
          </div>
        </div>
        <div className="hero-right">
          <img src={profileImg} alt="Rohit Kasaudhan" />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-wrap" aria-hidden="true">
        <div className="marquee-track">
          <span>Machine Learning</span><span className="dot">&#9679;</span>
          <span>Computer Vision</span><span className="dot">&#9679;</span>
          <span>Natural Language Processing</span><span className="dot">&#9679;</span>
          <span>AI Agents</span><span className="dot">&#9679;</span>
          <span>Generative AI &amp; RAG</span><span className="dot">&#9679;</span>
          <span>Python</span><span className="dot">&#9679;</span>
          <span>Deep Learning</span><span className="dot">&#9679;</span>
          <span>Machine Learning</span><span className="dot">&#9679;</span>
          <span>Computer Vision</span><span className="dot">&#9679;</span>
          <span>Natural Language Processing</span><span className="dot">&#9679;</span>
          <span>AI Agents</span><span className="dot">&#9679;</span>
          <span>Generative AI &amp; RAG</span><span className="dot">&#9679;</span>
          <span>Python</span><span className="dot">&#9679;</span>
          <span>Deep Learning</span><span className="dot">&#9679;</span>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="about" id="about">
        <div className="reveal">
          <div className="section-label">Who I am</div>
          <h2 className="section-title">Building Intelligent Systems,<br />Solving Complex Problems</h2>
          <p className="about-text">I'm a Computer Science &amp; Engineering student at KIIT University with a strong passion for Artificial Intelligence and Machine Learning. I specialize in building conversational AI agents, face recognition systems, and real-time alert platforms.</p>
          <p className="about-text">From designing agentic workflows with LangGraph and RAG architectures to developing desktop and web applications, I enjoy bridging the gap between theoretical algorithms and practical, scalable software solutions.</p>
          <div className="skills-wrap">
            <span className="skill">Python</span>
            <span className="skill">Machine Learning</span>
            <span className="skill">RAG &amp; LLMs</span>
            <span className="skill">SQL</span>
            <span className="skill">OpenCV</span>
            <span className="skill">LangGraph</span>
            <span className="skill">Streamlit</span>
            <span className="skill">Docker</span>
          </div>
        </div>
        <div className="about-right reveal reveal-delay-2">
          <div className="acard">
            <div className="acard-num">10+</div>
            <div className="acard-lbl">Projects</div>
            <div className="acard-desc">Personal, academic, and open-source developments</div>
          </div>

          <div className="acard">
            <div className="acard-num">3+</div>
            <div className="acard-lbl">AI Systems</div>
            <div className="acard-desc">Integrating state-of-the-art LLMs, APIs, and computer vision</div>
          </div>
          <div className="acard acard-orange">
            <div className="acard-num">100%</div>
            <div className="acard-lbl">Dedication</div>
            <div className="acard-desc">Committed to clean code and continuous learning</div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="services" id="services">
        <div className="services-header reveal">
          <div className="section-label">My Expertise</div>
          <h2 className="section-title">What I Do</h2>
        </div>
        <div className="svc-grid">
          <div className="svc-item reveal reveal-delay-1">
            <div className="svc-line"></div>
            <div className="svc-num">01</div>
            <div className="svc-name">AI &amp; Machine Learning</div>
            <div className="svc-desc">Developing predictive models, fine-tuning, and implementing computer vision applications with OpenCV.</div>
          </div>
          <div className="svc-item reveal reveal-delay-2">
            <div className="svc-line"></div>
            <div className="svc-num">02</div>
            <div className="svc-name">Conversational Agents</div>
            <div className="svc-desc">Designing intelligent state-machine agents using LangGraph and Retrieval-Augmented Generation (RAG) models.</div>
          </div>
          <div className="svc-item reveal reveal-delay-3">
            <div className="svc-line"></div>
            <div className="svc-num">03</div>
            <div className="svc-name">Full-Stack Web Apps</div>
            <div className="svc-desc">Building interactive UIs with Streamlit/HTML/CSS/JS and secure backends connected to MySQL databases.</div>
          </div>
          <div className="svc-item reveal reveal-delay-1">
            <div className="svc-line"></div>
            <div className="svc-num">04</div>
            <div className="svc-name">Data Analytics</div>
            <div className="svc-desc">Manipulating and visualizing complex datasets using Python, Pandas, NumPy, and Matplotlib.</div>
          </div>
          <div className="svc-item reveal reveal-delay-2">
            <div className="svc-line"></div>
            <div className="svc-num">05</div>
            <div className="svc-name">Real-time Automation</div>
            <div className="svc-desc">Creating background script notifier systems, web scraping, and custom event alert mechanisms.</div>
          </div>
          <div className="svc-item reveal reveal-delay-3">
            <div className="svc-line"></div>
            <div className="svc-num">06</div>
            <div className="svc-name">DevOps &amp; Deployment</div>
            <div className="svc-desc">Containerizing environments with Docker and deploying scalable web services on platforms like Vercel.</div>
          </div>
        </div>
      </section>

      {/* ── WORK ── */}
      <section className="work" id="work">
        <div className="work-head reveal">
          <div>
            <div className="section-label">Selected Projects</div>
            <h2 className="section-title">Recent Work</h2>
          </div>
          <a className="btn-ghost" href="https://github.com/Rohit-kasaudhan" target="_blank" rel="noopener noreferrer">View All GitHub &#8594;</a>
        </div>
        <div className="work-grid">
          <a className="wcard reveal" href="https://github.com/Rohit-kasaudhan/Research-Paper-Q-A-Agent" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="wcard-cat">Conversational AI &middot; 2024</div>
            <div className="wcard-title">Research Paper Q&amp;A Agent</div>
            <div className="wcard-desc">Conversational AI agent answering questions from AI/ML research papers using Retrieval-Augmented Generation (RAG) with ChromaDB. Built with Gemini 2.5 Flash, LangGraph, and Streamlit.</div>
            <div className="wcard-img"><img src={researchQaImg} alt="Research Paper Q&amp;A Agent Preview" /></div>
            <div className="wcard-arr">&#8599;</div>
          </a>
          <a className="wcard reveal reveal-delay-1" href="https://github.com/Rohit-kasaudhan/Attend-X-Face-Recognition-Attendance-System-" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="wcard-cat">Computer Vision &middot; 2024</div>
            <div className="wcard-title">Attend-X Face Recognition Attendance System</div>
            <div className="wcard-desc">Desktop-based automated student attendance system implementing LBPH face recognition using OpenCV, Tkinter, and MySQL.</div>
            <div className="wcard-img"><img src={attendxImg} alt="Attend-X Face Recognition Attendance System Preview" /></div>
            <div className="wcard-arr">&#8599;</div>
          </a>
          <a className="wcard reveal reveal-delay-2" href="https://github.com/Rohit-kasaudhan/NEPSE-Stock-Price-Notifier" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="wcard-cat">Automation &middot; 2023</div>
            <div className="wcard-title">NEPSE Stock Price Notifier</div>
            <div className="wcard-desc">Real-time web scraping alert engine tracking Nepal Stock Exchange prices, sending SMTP emails when thresholds cross.</div>
            <div className="wcard-img"><img src={nepseImg} alt="NEPSE Stock Price Notifier Preview" /></div>
            <div className="wcard-arr">&#8599;</div>
          </a>
          <a className="wcard reveal reveal-delay-3" href="https://github.com/Rohit-kasaudhan/Email_Spam_Detection" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="wcard-cat">Machine Learning &middot; 2024</div>
            <div className="wcard-title">Email Spam Detection</div>
            <div className="wcard-desc">A machine learning web application that classifies email and SMS messages as Spam or Ham (Legitimate) using Multinomial Naive Bayes and TF-IDF text vectorization, with a clean interactive Streamlit GUI.</div>
            <div className="wcard-img"><img src={emailSpamImg} alt="Email Spam Detection Preview" /></div>
            <div className="wcard-arr">&#8599;</div>
          </a>
        </div>
      </section>

      {/* ── CTA / CONTACT ── */}
      <section className="cta" id="contact">
        <div className="cta-inner reveal">
          <div className="section-label">Let&rsquo;s Collaborate</div>
          <h2 className="cta-title">Ready to Build<br />Something <span>Great?</span></h2>
          <p className="cta-sub">I&rsquo;m currently available for internships, open-source projects, and collaborative research. Let&rsquo;s connect and build intelligent solutions.</p>
          <a className="btn-primary" href="https://www.linkedin.com/in/rohit-kasaudhan" target="_blank" rel="noopener noreferrer" style={{ margin: '0 auto' }}>Get In Touch &#8594;</a>
          <br />
          <a className="cta-email" href="mailto:ksdrohit28@gmail.com">&#9993;&nbsp; ksdrohit28@gmail.com</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-logo">Rohit<span>.</span></div>
        <div className="footer-links">
          <a href="https://github.com/Rohit-kasaudhan" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/rohit-kasaudhan" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://x.com/RohitKasau5779" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://instagram.com/ksdrohit28" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
        <div className="footer-copy">&copy; 2026 Rohit Kasaudhan. All rights reserved.</div>
      </footer>

      {/* ── SPARKY VIRTUAL PET COMPANION ── */}
      <AIPet />
    </>
  );
}

export default App;
