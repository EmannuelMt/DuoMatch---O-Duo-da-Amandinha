import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';
import { 
  FaHeart, FaGamepad, FaUsers, FaTrophy, FaChartLine,
  FaStar, FaFire, FaCheckCircle, FaTimesCircle,
  FaMusic, FaArrowDown, FaPlay, FaTimes, FaGithub, FaTwitter, FaLinkedin,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaInstagram, FaYoutube,
  FaRocket, FaCrown, FaInfinity, FaBriefcase, FaShareAlt
} from 'react-icons/fa';
import { GiCrossedSwords, GiSkills } from 'react-icons/gi';
import { IoGameController, IoHappy, IoSchool, IoFlash } from 'react-icons/io5';

const Home = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [candidateResult, setCandidateResult] = useState<{score?: string, resultado?: string, success?: boolean, error?: string} | null>(null);
  const [showResults, setShowResults] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Requisitos da Amandinha (Exemplo de lógica)
  const amandinhaRequisitos = {
    obrigatorios: {
      jogarBemVava: true,
      jogarBemDeJett: true,
      saberUsarOp: true
    },
    redFlags: ["toxico", "ignoraMensagem", "naoRespeita", "rageQuit", "soJogaSozinho"],
    greenFlags: ["mandaBomDia", "elogia", "escutaBem", "jogaEmDupla", "engracado"],
    skills: { aim: 0, gameSense: 0, movimentacao: 0, clutch: 0 },
    vidaReal: { disponibilidadeNoite: true, disponibilidadeFimDeSemana: true, respondeRapido: true, chamaPraSair: true },
    personalidade: { tratarBem: true, serFofo: true, serCarinhoso: true, serEngracado: true, naoSerToxico: true, legal: true },
    extras: { gostaAnime: true, gostaMusica: true, gostaMemes: true, mandaTikTok: true },
    valorPessoal: { sabeCozinhar: true, organizado: true, bonito: true }
  };

  // Estado do questionário
  const [questionario, setQuestionario] = useState<any>({
    jogarBemVava: false,
    jogarBemDeJett: false,
    saberUsarOp: false,
    aim: 5,
    gameSense: 5,
    movimentacao: 5,
    clutch: 5,
    disponibilidadeNoite: false,
    disponibilidadeFimDeSemana: false,
    respondeRapido: false,
    chamaPraSair: false,
    tratarBem: false,
    serFofo: false,
    serCarinhoso: false,
    serEngracado: false,
    naoSerToxico: false,
    legal: false,
    gostaAnime: false,
    gostaMusica: false,
    gostaMemes: false,
    mandaTikTok: false,
    sabeCozinhar: false,
    organizado: false,
    bonito: false,
    nenhumaPersonalidade: false,
    nenhumaVidaReal: false,
    nenhumaExtras: false,
    nenhumaValorPessoal: false,
    greenFlags: [],
    nenhumaGreenFlag: false,
    comportamento: {
      toxico: false,
      ignoraMensagem: false,
      naoRespeita: false,
      rageQuit: false,
      soJogaSozinho: false,
      nenhuma: false
    },
    streakDiasJogandoJunto: 0
  });

  const handleQuestionarioChange = (field: string, value: any) => {
    setQuestionario((prev: any) => {
      const newState = { ...prev, [field]: value };
      
      // Lógica de "Nenhuma" para seções específicas
      const sections: { [key: string]: string[] } = {
        nenhumaPersonalidade: ['tratarBem', 'serFofo', 'serCarinhoso', 'serEngracado', 'naoSerToxico', 'legal'],
        nenhumaVidaReal: ['disponibilidadeNoite', 'disponibilidadeFimDeSemana', 'respondeRapido', 'chamaPraSair'],
        nenhumaExtras: ['gostaAnime', 'gostaMusica', 'gostaMemes', 'mandaTikTok'],
        nenhumaValorPessoal: ['sabeCozinhar', 'organizado', 'bonito']
      };

      for (const [noneKey, fields] of Object.entries(sections)) {
        if (field === noneKey && value) {
          // Se marcou "nenhuma", desmarca todas as outras da seção
          fields.forEach(f => newState[f] = false);
        } else if (fields.includes(field) && value) {
          // Se marcou qualquer outra, desmarca "nenhuma" da seção
          newState[noneKey] = false;
        }
      }

      return newState;
    });
  };

  const handleComportamentoChange = (field: string, value: boolean) => {
    setQuestionario((prev: any) => {
      const newComportamento = { ...prev.comportamento, [field]: value };
      
      if (field === 'nenhuma' && value) {
        // Se marcou "nenhuma", desmarca todas as outras
        Object.keys(newComportamento).forEach(key => {
          if (key !== 'nenhuma') newComportamento[key] = false;
        });
      } else if (field !== 'nenhuma' && value) {
        // Se marcou qualquer outra, desmarca "nenhuma"
        newComportamento.nenhuma = false;
      }
      
      return {
        ...prev,
        comportamento: newComportamento
      };
    });
  };

  const handleGreenFlagChange = (flag: string, checked: boolean) => {
    setQuestionario((prev: any) => {
      let newFlags = checked 
        ? [...prev.greenFlags, flag]
        : prev.greenFlags.filter((f: string) => f !== flag);
      
      return {
        ...prev,
        greenFlags: newFlags,
        nenhumaGreenFlag: false
      };
    });
  };

  const handleNenhumaGreenFlagChange = (checked: boolean) => {
    setQuestionario((prev: any) => ({
      ...prev,
      greenFlags: checked ? [] : prev.greenFlags,
      nenhumaGreenFlag: checked
    }));
  };

  const validarObrigatorios = (candidato: any, requisitos: any) => {
    return Object.keys(requisitos.obrigatorios).every(req => candidato[req]);
  };

  const temRedFlag = (candidato: any, requisitos: any) => {
    return requisitos.redFlags.some((flag: string) => candidato.comportamento[flag]);
  };

  const calcularScore = (candidato: any, requisitos: any) => {
    let score = 0;
    let total = 0;

    Object.keys(requisitos.skills).forEach(skill => {
      score += candidato[skill] || 0;
      total += 10;
    });

    Object.keys(requisitos.personalidade).forEach(p => {
      if (candidato[p]) score += 6;
      total += 6;
    });

    Object.keys(requisitos.vidaReal).forEach(v => {
      if (candidato[v]) score += 4;
      total += 4;
    });

    Object.keys(requisitos.extras).forEach(e => {
      if (candidato[e]) score += 2;
      total += 2;
    });

    Object.keys(requisitos.valorPessoal).forEach(v => {
      if (candidato[v]) score += 7;
      total += 7;
    });

    requisitos.greenFlags.forEach((flag: string) => {
      if (candidato.greenFlags.includes(flag)) {
        score += 5;
        total += 5;
      }
    });

    score += candidato.streakDiasJogandoJunto * 2;
    total += 20;

    return ((score / total) * 100).toFixed(2);
  };

  const classificar = (score: number) => {
    if (score >= 90) return "CASA LOGO 💍🔥";
    if (score >= 75) return "Altíssimo potencial 😎";
    if (score >= 60) return "Promissor 👀";
    if (score >= 40) return "Amizade colorida 😂";
    return "Só duo no máximo 💀";
  };

  const avaliarCandidato = () => {
    // Validação de obrigatoriedade
    const sectionsToValidate = [
      { name: "Red Flags", fields: Object.keys(questionario.comportamento), data: questionario.comportamento },
      { name: "Green Flags", isGreen: true },
      { name: "Personalidade", fields: ['tratarBem', 'serFofo', 'serCarinhoso', 'serEngracado', 'naoSerToxico', 'legal'], noneKey: 'nenhumaPersonalidade' },
      { name: "Vida Real", fields: ['disponibilidadeNoite', 'disponibilidadeFimDeSemana', 'respondeRapido', 'chamaPraSair'], noneKey: 'nenhumaVidaReal' },
      { name: "Extras", fields: ['gostaAnime', 'gostaMusica', 'gostaMemes', 'mandaTikTok'], noneKey: 'nenhumaExtras' },
      { name: "Valor Pessoal", fields: ['sabeCozinhar', 'organizado', 'bonito'], noneKey: 'nenhumaValorPessoal' }
    ];

    for (const section of sectionsToValidate) {
      let isAnswered = false;
      if (section.isGreen) {
        isAnswered = questionario.greenFlags.length > 0 || questionario.nenhumaGreenFlag;
      } else if (section.data) {
        isAnswered = Object.values(section.data).some(v => v === true);
      } else if (section.fields && section.noneKey) {
        isAnswered = section.fields.some(f => questionario[f] === true) || questionario[section.noneKey];
      }

      if (!isAnswered) {
        alert(`Por favor, responda a seção "${section.name}". Todas as seções são obrigatórias.`);
        return;
      }
    }

    if (!validarObrigatorios(questionario, amandinhaRequisitos)) {
      setCandidateResult({ error: "Reprovado nos requisitos mínimos 💀" });
      setShowResults(true);
      return;
    }

    if (temRedFlag(questionario, amandinhaRequisitos)) {
      setCandidateResult({ error: "Eliminado por red flag 🚩" });
      setShowResults(true);
      return;
    }

    const scoreStr = calcularScore(questionario, amandinhaRequisitos);
    const scoreNum = parseFloat(scoreStr);
    const resultado = classificar(scoreNum);
    setCandidateResult({ score: scoreStr + "%", resultado, success: true });
    setShowResults(true);
    
    // Scroll to result
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DuoMatch - Encontre o Duo Perfeito para Amandinha',
          text: 'O matchmaker definitivo pra achar alguém que jogue junto, combine contigo e ainda renda aquelas partidas insanas.',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  // Animações de scroll
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-image-overlay"></div>
          <div className="hero-gradient-overlay"></div>
          <div className="hero-grid"></div>
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                animationDelay: `${Math.random() * 5}s`
              }} />
            ))}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-badge animate-on-scroll">
            <FaHeart /> Match Finder 3000
          </div>
          <h1 className="hero-title animate-on-scroll">
            Encontre o <span className="hero-title-gradient">Duo Perfeito</span> para Amandinha 🎮💖
          </h1>
          <p className="hero-description animate-on-scroll">
            O matchmaker definitivo pra achar alguém que jogue junto, combine contigo e ainda renda aquelas partidas insanas. Bora formar uma dupla lendária e dominar tudo!
          </p>
          <div className="hero-actions animate-on-scroll">
            <button className="btn-primary" onClick={() => document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' })}>
              <FaHeart /> Fazer o Teste Agora
              <span className="btn-glow"></span>
            </button>
            <button className="btn-secondary" onClick={() => setIsVideoModalOpen(true)}>
              <FaPlay /> Ver Demo
            </button>
            <button className="btn-share" onClick={handleShare}>
              <FaShareAlt /> Compartilhar
            </button>
          </div>
        </div>

        <div className="hero-scroll-indicator" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
          <span>SCROLL</span>
          <FaArrowDown />
        </div>
      </section>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            className="share-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareModalOpen(false)}
          >
            <motion.div 
              className="share-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="share-modal-close" onClick={() => setIsShareModalOpen(false)}>
                <FaTimes />
              </button>
              <h3 className="share-modal-title">Compartilhar DuoMatch</h3>
              <p className="share-modal-subtitle">Espalhe a palavra e ajude a Amandinha a achar o duo perfeito!</p>
              
              <div className="share-options">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent('Encontre o Duo Perfeito para Amandinha! ' + window.location.href)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="share-option whatsapp"
                >
                  <FaRocket /> WhatsApp
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Encontre o Duo Perfeito para Amandinha! ')}&url=${encodeURIComponent(window.location.href)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="share-option twitter"
                >
                  <FaTwitter /> Twitter
                </a>
                <button 
                  className="share-option copy"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copiado para a área de transferência!');
                  }}
                >
                  <FaGithub /> Copiar Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="video-modal-overlay" onClick={() => setIsVideoModalOpen(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setIsVideoModalOpen(false)}>
              <FaTimes />
            </button>
            <div className="video-modal-iframe-container">
              <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-logo-left animate-on-scroll">
              <div className="about-logo-container">
                <div className="about-logo-glow"></div>
                <GiCrossedSwords size={120} color="#7C3AED" />
              </div>
            </div>
            <div className="about-content animate-on-scroll">
              <div className="section-badge">
                <FaHeart /> Sobre Nós
              </div>
              <h2 className="section-title">
                O Matchmaker <span className="section-title-gradient">Definitivo</span> para a Amandinha
              </h2>
              <p className="about-description">
                Criamos o algoritmo de compatibilidade mais avançado para encontrar quem realmente 
                merece jogar ao lado da Amandinha. Combinamos skills, vibe e parceria para garantir 
                que a dupla seja imbatível.
              </p>
              <div className="about-features">
                <div className="about-feature">
                  <div className="about-feature-icon"><IoGameController /></div>
                  <div>
                    <h4>Análise de Skill</h4>
                    <p>Avaliação precisa do seu nível de jogo</p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon"><IoHappy /></div>
                  <div>
                    <h4>Compatibilidade Social</h4>
                    <p>Alinhamento de personalidade e estilo</p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon"><IoSchool /></div>
                  <div>
                    <h4>Aprendizado Contínuo</h4>
                    <p>Algoritmo que melhora com cada match</p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon"><IoFlash /></div>
                  <div>
                    <h4>Match Instantâneo</h4>
                    <p>Resultados em menos de 30 segundos</p>
                  </div>
                </div>
              </div>
              <div className="about-values">
                <span className="value-tag"><FaHeart /> Respeito</span>
                <span className="value-tag"><FaGamepad /> Diversão</span>
                <span className="value-tag"><FaUsers /> Comunidade</span>
                <span className="value-tag"><FaTrophy /> Competitividade</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section id="quiz" className="quiz-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <div className="section-badge">
              <FaGamepad /> Questionário
            </div>
            <h2 className="section-title">
              Você é o <span className="section-title-gradient">Duo Ideal</span>?
            </h2>
            <p className="section-description">
              Responda ao questionário abaixo e veja se você tem o que é preciso para ser o duo da Amandinha
            </p>
          </div>

          <div className="quiz-container animate-on-scroll">
            {/* Requisitos Obrigatórios */}
            <div className="quiz-card">
              <h3><FaCheckCircle /> Requisitos Mínimos</h3>
              <div className="checkbox-group">
                <label><input type="checkbox" checked={questionario.jogarBemVava} onChange={(e) => handleQuestionarioChange('jogarBemVava', e.target.checked)} /> Joga Vava</label>
                <label><input type="checkbox" checked={questionario.jogarBemDeJett} onChange={(e) => handleQuestionarioChange('jogarBemDeJett', e.target.checked)} /> Jogar bem de Jett</label>
                <label><input type="checkbox" checked={questionario.saberUsarOp} onChange={(e) => handleQuestionarioChange('saberUsarOp', e.target.checked)} /> Saber usar OP</label>
              </div>
            </div>

            {/* Skills */}
            <div className="quiz-card">
              <h3><GiSkills /> Habilidades</h3>
              {['aim', 'gameSense', 'movimentacao', 'clutch'].map(skill => (
                <div key={skill} className="slider-group">
                  <label>{skill === 'aim' ? 'AIM' : skill === 'gameSense' ? 'Game Sense' : skill === 'movimentacao' ? 'Movimentação' : 'Clutch'}: {questionario[skill]}/10</label>
                  <input type="range" min="0" max="10" value={questionario[skill]} onChange={(e) => handleQuestionarioChange(skill, parseInt(e.target.value))} />
                </div>
              ))}
            </div>

            {/* Red Flags */}
            <div className="quiz-card red-flags">
              <h3><FaTimesCircle /> Red Flags (Obrigatório)</h3>
              <div className="checkbox-group">
                {amandinhaRequisitos.redFlags.map(flag => (
                  <label key={flag}>
                    <input type="checkbox" checked={questionario.comportamento[flag]} onChange={(e) => handleComportamentoChange(flag, e.target.checked)} />
                    {flag === 'toxico' ? 'Tóxico' : flag === 'ignoraMensagem' ? 'Ignora mensagem' : flag === 'naoRespeita' ? 'Não respeita' : flag === 'rageQuit' ? 'Rage Quit' : 'Só joga sozinho'}
                  </label>
                ))}
                <label className="none-option">
                  <input type="checkbox" checked={questionario.comportamento.nenhuma} onChange={(e) => handleComportamentoChange('nenhuma', e.target.checked)} />
                  <strong>Não tenho nenhuma</strong>
                </label>
              </div>
            </div>

            {/* Green Flags */}
            <div className="quiz-card green-flags">
              <h3><FaCheckCircle /> Green Flags (Obrigatório)</h3>
              <div className="checkbox-group">
                {amandinhaRequisitos.greenFlags.map(flag => (
                  <label key={flag}>
                    <input type="checkbox" checked={questionario.greenFlags.includes(flag)} onChange={(e) => handleGreenFlagChange(flag, e.target.checked)} />
                    {flag === 'mandaBomDia' ? 'Manda bom dia' : flag === 'elogia' ? 'Elogia' : flag === 'escutaBem' ? 'Escuta bem' : flag === 'jogaEmDupla' ? 'Joga em dupla' : 'Engraçado'}
                  </label>
                ))}
                <label className="none-option">
                  <input type="checkbox" checked={questionario.nenhumaGreenFlag} onChange={(e) => handleNenhumaGreenFlagChange(e.target.checked)} />
                  <strong>Não tenho nenhuma</strong>
                </label>
              </div>
            </div>

            {/* Personalidade */}
            <div className="quiz-card">
              <h3><IoHappy /> Personalidade (Obrigatório)</h3>
              <div className="checkbox-group">
                {Object.keys(amandinhaRequisitos.personalidade).map(p => (
                  <label key={p}>
                    <input type="checkbox" checked={questionario[p]} onChange={(e) => handleQuestionarioChange(p, e.target.checked)} />
                    {p === 'tratarBem' ? 'Trata bem' : p === 'serFofo' ? 'Ser fofo' : p === 'serCarinhoso' ? 'Ser carinhoso' : p === 'serEngracado' ? 'Ser engraçado' : p === 'naoSerToxico' ? 'Não é tóxico' : 'Legal'}
                  </label>
                ))}
                <label className="none-option">
                  <input type="checkbox" checked={questionario.nenhumaPersonalidade} onChange={(e) => handleQuestionarioChange('nenhumaPersonalidade', e.target.checked)} />
                  <strong>Nenhuma das anteriores</strong>
                </label>
              </div>
            </div>

            {/* Vida Real */}
            <div className="quiz-card">
              <h3><FaBriefcase /> Vida Real (Obrigatório)</h3>
              <div className="checkbox-group">
                {Object.keys(amandinhaRequisitos.vidaReal).map(v => (
                  <label key={v}>
                    <input type="checkbox" checked={questionario[v]} onChange={(e) => handleQuestionarioChange(v, e.target.checked)} />
                    {v === 'disponibilidadeNoite' ? 'Disponível à noite' : v === 'disponibilidadeFimDeSemana' ? 'Disponível fim de semana' : v === 'respondeRapido' ? 'Responde rápido' : 'Chama pra sair'}
                  </label>
                ))}
                <label className="none-option">
                  <input type="checkbox" checked={questionario.nenhumaVidaReal} onChange={(e) => handleQuestionarioChange('nenhumaVidaReal', e.target.checked)} />
                  <strong>Nenhuma das anteriores</strong>
                </label>
              </div>
            </div>

            {/* Extras */}
            <div className="quiz-card">
              <h3><FaMusic /> Extras (Obrigatório)</h3>
              <div className="checkbox-group">
                {Object.keys(amandinhaRequisitos.extras).map(e => (
                  <label key={e}>
                    <input type="checkbox" checked={questionario[e]} onChange={(e) => handleQuestionarioChange(e, e.target.checked)} />
                    {e === 'gostaAnime' ? 'Gosta de anime' : e === 'gostaMusica' ? 'Gosta de música' : e === 'gostaMemes' ? 'Gosta de memes' : 'Manda TikTok'}
                  </label>
                ))}
                <label className="none-option">
                  <input type="checkbox" checked={questionario.nenhumaExtras} onChange={(e) => handleQuestionarioChange('nenhumaExtras', e.target.checked)} />
                  <strong>Nenhuma das anteriores</strong>
                </label>
              </div>
            </div>

            {/* Valor Pessoal */}
            <div className="quiz-card">
              <h3><FaCrown /> Valor Pessoal (Obrigatório)</h3>
              <div className="checkbox-group">
                {Object.keys(amandinhaRequisitos.valorPessoal).map(v => (
                  <label key={v}>
                    <input type="checkbox" checked={questionario[v]} onChange={(e) => handleQuestionarioChange(v, e.target.checked)} />
                    {v === 'sabeCozinhar' ? 'Sabe cozinhar' : v === 'organizado' ? 'Organizado' : 'Bonito'}
                  </label>
                ))}
                <label className="none-option">
                  <input type="checkbox" checked={questionario.nenhumaValorPessoal} onChange={(e) => handleQuestionarioChange('nenhumaValorPessoal', e.target.checked)} />
                  <strong>Nenhuma das anteriores</strong>
                </label>
              </div>
            </div>

            {/* Streak */}
            <div className="quiz-card">
              <h3><FaFire /> Streak de dias jogando junto</h3>
              <div className="slider-group">
                <label>Dias: {questionario.streakDiasJogandoJunto}</label>
                <input type="range" min="0" max="30" value={questionario.streakDiasJogandoJunto} onChange={(e) => handleQuestionarioChange('streakDiasJogandoJunto', parseInt(e.target.value))} />
              </div>
            </div>

            <button className="quiz-submit-btn" onClick={avaliarCandidato}>
              <FaHeart /> Avaliar Compatibilidade
            </button>

            {/* Resultados */}
            <AnimatePresence>
              {showResults && candidateResult && (
                <motion.div 
                  ref={resultRef}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    duration: 0.5 
                  }}
                  className={`quiz-results ${candidateResult.success ? 'success' : 'error'}`}
                >
                  {candidateResult.error ? (
                    <motion.div
                      initial={{ rotate: -10 }}
                      animate={{ rotate: 0 }}
                      transition={{ repeat: 5, repeatType: "reverse", duration: 0.1 }}
                    >
                      <FaTimesCircle size={64} />
                      <h3 className="mt-4">{candidateResult.error}</h3>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <div className="result-icon-glow">
                          <FaTrophy size={64} />
                        </div>
                      </motion.div>
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="result-score"
                      >
                        Score: {candidateResult.score}
                      </motion.h3>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="result-text"
                      >
                        {candidateResult.resultado}
                      </motion.p>
                      
                      {parseFloat(candidateResult.score || "0") >= 90 && (
                        <motion.div 
                          className="confetti-placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          💍💍💍💍💍
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <GiCrossedSwords /> DuoMatch
            </div>
            <div className="footer-links">
              <a href="#">Privacidade</a>
              <a href="#">Termos</a>
              <a href="#">Cookies</a>
            </div>
            <p className="footer-copy">© 2026 DuoMatch. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
