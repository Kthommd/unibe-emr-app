import React, { useState, useEffect, useRef, memo } from "react";

/*****************
 * English/Spanish
 *****************/
const translations = {
  es: {
    appName: "UNIBE-EMR",
    studentName: "Nombre del Estudiante",
    studentId: "ID del Estudiante",
    login: "Ingresar",
    myEncounters: "Mis Encuentros",
    newPatient: "Nuevo Paciente",
    patientInfo: "Información del Paciente",
    patientName: "Nombre del Paciente",
    age: "Edad",
    sex: "Sexo",
    male: "Masculino",
    female: "Femenino",
    other: "Otro",
    vitalSigns: "Signos Vitales",
    fc: "FC (lpm)",
    fr: "FR (rpm)",
    ta: "TA (mmHg)",
    temp: "Temp (°C)",
    sato2: "SatO₂ (%)",
    createRecord: "Crear Expediente",
    patientList: "Lista de Pacientes",
    noEncounters: "No hay encuentros guardados. Cree un nuevo paciente para comenzar.",
    loadEncounter: "Cargar Encuentro",
    deleteEncounter: "Eliminar",
    confirmDelete: "¿Estás seguro de que quieres eliminar este encuentro? Esta acción no se puede deshacer.",
    confirm: "Confirmar",
    cancel: "Cancelar",
    soapNote: "Nota SOAP",
    requests: "Solicitudes",
    subjective: "Subjetivo",
    objective: "Objetivo",
    analysis: "Análisis",
    plan: "Plan",
    labs: "Laboratorios",
    imaging: "Imágenes",
    referrals: "Referencias",
    save: "Guardar",
    saving: "Guardando...",
    saveSuccess: "Encuentro guardado con éxito.",
    saveFailed: "Error al guardar (Local)",
    exportPDF: "Exportar a PDF",
    exporting: "Exportando...",
    pdfLibLoading: "Las bibliotecas de PDF se están cargando. Inténtalo de nuevo en un momento.",
    pdfNotReady: "Abra el expediente (EMR) antes de exportar el PDF.",
    pdfFailed: "No se pudo exportar PDF. Revise consola.",
    patientHeader: "DATOS DEL PACIENTE",
    studentHeader: "DATOS DEL ESTUDIANTE",
    timestampHeader: "Fecha de Creación",
    backToList: "Volver a la Lista",
    pdfFileName: "Expediente_UNIBE",
    exportJSON: "Exportar JSON",
    importJSON: "Importar JSON",
    importing: "Importando...",
    dataImported: "Datos importados.",
    clearAll: "Borrar todo",
    confirmClear: "¿Borrar todos los encuentros locales de este estudiante?",
    clearedAll: "Todos los encuentros locales fueron borrados.",
    testsPassed: "Pruebas locales: OK",
    testsFailed: "Pruebas locales fallaron"
  },
  en: {
    appName: "UNIBE-EMR",
    studentName: "Student Name",
    studentId: "Student ID",
    login: "Login",
    myEncounters: "My Encounters",
    newPatient: "New Patient",
    patientInfo: "Patient Information",
    patientName: "Patient Name",
    age: "Age",
    sex: "Sex",
    male: "Male",
    female: "Female",
    other: "Other",
    vitalSigns: "Vital Signs",
    fc: "HR (bpm)",
    fr: "RR (rpm)",
    ta: "BP (mmHg)",
    temp: "Temp (°F)",
    sato2: "O₂ Sat (%)",
    createRecord: "Create Record",
    patientList: "Patient List",
    noEncounters: "No saved encounters. Create a new patient to begin.",
    loadEncounter: "Load Encounter",
    deleteEncounter: "Delete",
    confirmDelete: "Are you sure you want to delete this encounter? This action cannot be undone.",
    confirm: "Confirm",
    cancel: "Cancel",
    soapNote: "SOAP Note",
    requests: "Requests",
    subjective: "Subjective",
    objective: "Objective",
    analysis: "Analysis",
    plan: "Plan",
    labs: "Laboratories",
    imaging: "Imaging",
    referrals: "Referrals",
    save: "Save",
    saving: "Saving...",
    saveSuccess: "Encounter saved successfully.",
    saveFailed: "Failed to save (Local)",
    exportPDF: "Export to PDF",
    exporting: "Exporting...",
    pdfLibLoading: "PDF libraries are loading. Please try again in a moment.",
    pdfNotReady: "Open the record (EMR) before exporting the PDF.",
    pdfFailed: "Could not export PDF. Check console.",
    patientHeader: "PATIENT DATA",
    studentHeader: "STUDENT DATA",
    timestampHeader: "Creation Date",
    backToList: "Back to List",
    pdfFileName: "Record_UNIBE",
    exportJSON: "Export JSON",
    importJSON: "Import JSON",
    importing: "Importing...",
    dataImported: "Data imported.",
    clearAll: "Clear all",
    confirmClear: "Clear all local encounters for this student?",
    clearedAll: "All local encounters were cleared.",
    testsPassed: "Local tests: OK",
    testsFailed: "Local tests failed"
  }
};

/*****************
 * My little helpers
 *****************/
const getT = (lang) => translations[lang] || translations.en; // robust fallback
const canExportGuard = (page, encounter) => page === 'emr' && !!encounter; // pure helper for tests & UI state
const sanitizeFilename = (s) => (s || 'Paciente').toString().replace(/[^\w-]+/g, '_');
const isValidPdfRoot = (el) => !!(el && el.nodeType === 1 && typeof el.getBoundingClientRect === 'function');

/*****************
 * Local storage please work
 *****************/
const localKey = (sid) => `unibe_emr_local_${sid || 'unknown'}`;
const loadLocal = (sid) => {
  try {
    return JSON.parse(localStorage.getItem(localKey(sid)) || "[]");
  } catch {
    return [];
  }
};
const saveLocalList = (sid, list) => localStorage.setItem(localKey(sid), JSON.stringify(list || []));
const upsertLocal = (sid, encounter) => {
  const list = loadLocal(sid);
  const idx = list.findIndex((e) => e.id === encounter.id);
  if (idx >= 0) list[idx] = encounter; else list.push(encounter);
  saveLocalList(sid, list);
  return list;
};
const deleteLocal = (sid, id) => {
  const list = loadLocal(sid).filter((e) => e.id !== id);
  saveLocalList(sid, list);
  return list;
};
const clearLocal = (sid) => saveLocalList(sid, []);

/*****************
 * UI code things
 *****************/
const Toast = ({ message, show, tone = "green" }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [show, message]);
  if (!visible) return null;
  const bg = tone === "red" ? "bg-red-600" : tone === "amber" ? "bg-amber-600" : "bg-green-600";
  return (
    <div className={`fixed bottom-5 right-5 ${bg} text-white px-6 py-3 rounded-lg shadow-2xl transition-opacity`}>{message}</div>
  );
};

const ConfirmModal = ({ show, message, onConfirm, onCancel, t }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white p-7 rounded-lg shadow-xl w-full max-w-sm m-4">
        <p className="mb-6 text-lg text-gray-800">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-5 py-2 bg-gray-200 rounded-md hover:bg-gray-300">{t.cancel}</button>
          <button onClick={onConfirm} className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t.confirm}</button>
        </div>
      </div>
    </div>
  );
};

/*****************
 * App (Local-only)
 *****************/
export default function App() {
  const [page, setPage] = useState("login");
  const [language, setLanguage] = useState("es");
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "" });
  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", tone: "green" });
  const [modal, setModal] = useState({ show: false, message: "", onConfirm: null });

  const t = getT(language);
  const pdfRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load encounters when student ID changes
  useEffect(() => {
    if (!studentInfo.id) return;
    setLoading(true);
    const list = loadLocal(studentInfo.id);
    setEncounters(list);
    setLoading(false);
  }, [studentInfo.id]);

  const showToast = (message, tone = "green") => setToast({ show: true, message, tone });

  const handleLogin = (name, id) => {
    if (!name || !id) return;
    setStudentInfo({ name, id });
    setPage("patientList");
  };

  const handleNewPatient = () => {
    setCurrentEncounter(null);
    setPage("newPatient");
  };

  const handleCreateRecord = (patientData) => {
    setCurrentEncounter({
      ...patientData,
      id: `${Date.now()}`,
      soap_S: "",
      soap_O: "",
      soap_A: "",
      soap_P: "",
      requests_Labs: "",
      requests_Imaging: "",
      requests_Refs: "",
      creationTimestamp: new Date().toISOString()
    });
    setPage("emr");
  };

  const handleSaveEncounter = () => {
    if (!currentEncounter || !studentInfo.id) return;
    setIsSaving(true);
    try {
      const list = upsertLocal(studentInfo.id, currentEncounter);
      setEncounters(list);
      showToast(t.saveSuccess, "green");
    } catch (e) {
      console.error("[UNIBE-EMR Local] Save error:", e);
      showToast(t.saveFailed, "red");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadEncounter = (enc) => {
    setCurrentEncounter(enc);
    setPage("emr");
  };

  const requestDeleteEncounter = (id) => {
    setModal({
      show: true,
      message: t.confirmDelete,
      onConfirm: () => {
        try {
          const list = deleteLocal(studentInfo.id, id);
          setEncounters(list);
          if (currentEncounter?.id === id) setCurrentEncounter(null);
        } catch (e) {
          console.error("[UNIBE-EMR Local] Delete error:", e);
        } finally {
          setModal({ show: false, message: "", onConfirm: null });
        }
      }
    });
  };

  const requestClearAll = () => {
    setModal({
      show: true,
      message: t.confirmClear,
      onConfirm: () => {
        try {
          if (!studentInfo?.id) {
            showToast(t.pdfNotReady, 'amber'); // reuse neutral message; avoids undefined toast key
            return;
          }
          clearLocal(studentInfo.id);
          setEncounters([]);
          setCurrentEncounter(null);
          showToast(t.clearedAll, 'green');
        } catch (e) {
          console.error('[UNIBE-EMR Local] ClearAll error:', e);
          showToast('Clear failed', 'red');
        } finally {
          setModal({ show: false, message: "", onConfirm: null });
        }
      }
    });
  };

  /*************************
   * Import / Export JSON
   *************************/
  const exportJSON = () => {
    const dataStr = JSON.stringify(encounters, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `UNIBE_EMR_${studentInfo.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Invalid JSON");
      saveLocalList(studentInfo.id, data);
      setEncounters(data);
      showToast(t.dataImported, "green");
    } catch (e) {
      console.error("[UNIBE-EMR Local] Import error:", e);
      showToast("Error al importar JSON", "red");
    }
  };

  /*************************
   * Robust multipage PDF
   *************************/
  const ensurePdfLibs = async () => {
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("Script load error: " + src));
      document.head.appendChild(s);
    });
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  };

  const handleExportPDF = async () => {
    // Guard: only from EMR page with a mounted PDF root
    if (!canExportGuard(page, currentEncounter)) {
      showToast(t.pdfNotReady, 'amber');
      return;
    }

    const root = pdfRef.current;
    if (!isValidPdfRoot(root)) {
      showToast(t.pdfNotReady, 'amber');
      return;
    }

    setIsExporting(true);
    try {
      await ensurePdfLibs();
      if (!window.jspdf || !window.html2canvas) {
        showToast(t.pdfLibLoading, "amber");
        return;
      }

      // Let the DOM settle
      await new Promise((r) => setTimeout(r, 50));
      const { jsPDF } = window.jspdf;
      const canvas = await window.html2canvas(root, {
        scale: Math.max(2, window.devicePixelRatio || 2),
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 10;
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const usableH = pdfH - margin * 2;
      const imgW = pdfW - margin * 2;
      const imgH = (canvas.height * imgW) / canvas.width;

      let heightLeft = imgH;
      pdf.addImage(imgData, "JPEG", margin, margin, imgW, imgH, undefined, "FAST");
      heightLeft -= usableH;

      while (heightLeft > 0) {
        pdf.addPage();
        const position = margin - (imgH - heightLeft);
        pdf.addImage(imgData, "JPEG", margin, position, imgW, imgH, undefined, "FAST");
        heightLeft -= usableH;
      }

      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.text(`${getT(language).appName} — ${(currentEncounter?.patientName || "-")}`, margin, pdfH - 6);
        pdf.text(`${i} / ${pageCount}`, pdfW - margin, pdfH - 6, { align: "right" });
      }

      const safeName = sanitizeFilename(currentEncounter?.patientName);
      pdf.setProperties({ title: `EMR ${safeName}`, author: studentInfo?.name || "UNIBE Student" });
      pdf.save(`${getT(language).pdfFileName}_${safeName}.pdf`);
    } catch (e) {
      console.error("[UNIBE-EMR Local] PDF export error:", e);
      showToast(getT(language).pdfFailed, "red");
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = canExportGuard(page, currentEncounter);

  const renderPage = () => {
    switch (page) {
      case "login":
        return <LoginPage onLogin={handleLogin} t={t} />;
      case "patientList":
        return (
          <PatientListPage
            encounters={encounters}
            onNewPatient={handleNewPatient}
            onLoadEncounter={handleLoadEncounter}
            onRequestDelete={requestDeleteEncounter}
            loading={loading}
            t={t}
            exportJSON={exportJSON}
            importJSON={() => fileInputRef.current?.click()}
            clearAll={requestClearAll}
          />
        );
      case "newPatient":
        return <NewPatientPage onCreateRecord={handleCreateRecord} t={t} />;
      case "emr":
        return (
          <EMRPage
            encounter={currentEncounter}
            setEncounter={setCurrentEncounter}
            studentInfo={studentInfo}
            onSave={handleSaveEncounter}
            onExport={handleExportPDF}
            isSaving={isSaving}
            isExporting={isExporting}
            onBack={() => setPage("patientList")}
            t={t}
          />
        );
      default:
        return <LoginPage onLogin={handleLogin} t={t} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <div className="container mx-auto p-4 max-w-5xl">
        <header className="flex justify-between items-center mb-6 pb-2 border-b-2 border-blue-600">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">{t.appName}</h1>
          <div className="flex items-center gap-2">
            {/* Language toggles (use buttons for a11y) */}
            <button
              type="button"
              aria-pressed={language === 'es'}
              className={`p-1 rounded-md ${language === "es" ? "font-bold bg-blue-100" : ""}`}
              onClick={() => setLanguage("es")}
            >
              ES
            </button>
            <span className="mx-1 text-gray-400">|</span>
            <button
              type="button"
              aria-pressed={language === 'en'}
              className={`p-1 rounded-md ${language === "en" ? "font-bold bg-blue-100" : ""}`}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            {/* Disabled Export button when export is not allowed */}
            {!canExport && (
              <button
                type="button"
                disabled
                title={t.pdfNotReady}
                className="ml-2 px-3 py-2 rounded-md bg-gray-200 text-gray-500 cursor-not-allowed text-sm"
              >
                {t.exportPDF}
              </button>
            )}
          </div>
        </header>

        <main>{renderPage()}</main>

        {/* Hidden input for JSON import */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => importJSON(e.target.files?.[0])}
        />

        {/* Always-mounted hidden PDF root when on EMR to keep ref stable */}
        <div
          style={{ position: 'fixed', left: 0, top: 0, opacity: 0, pointerEvents: 'none', width: '794px', zIndex: -1 }}
          aria-hidden="true"
        >
          {canExport && (
            <PDFLayout innerRef={pdfRef} encounter={currentEncounter} studentInfo={studentInfo} t={t} />
          )}
        </div>

        <Toast message={toast.message} show={toast.show} tone={toast.tone} />
        <ConfirmModal
          show={modal.show}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal({ show: false, message: "", onConfirm: null })}
          t={t}
        />
      </div>
    </div>
  );
}

/*****************
 * Pages
 *****************/
const LoginPage = ({ onLogin, t }) => {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onLogin(name, id);
        }}
      >
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">{t.studentName}</label>
          <input
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">{t.studentId}</label>
          <input
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm px-5 py-2.5">
          {t.login}
        </button>
      </form>
    </div>
  );
};

const PatientListPage = ({ encounters, onNewPatient, onLoadEncounter, onRequestDelete, loading, t, exportJSON, importJSON, clearAll }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
      <h2 className="text-xl font-bold text-gray-700">{t.myEncounters}</h2>
      <div className="flex flex-wrap gap-2">
        <button onClick={exportJSON} className="bg-indigo-500 text-white px-3 py-2 rounded-md hover:bg-indigo-600 text-sm">{t.exportJSON}</button>
        <button onClick={importJSON} className="bg-slate-500 text-white px-3 py-2 rounded-md hover:bg-slate-600 text-sm">{t.importJSON}</button>
        <button onClick={clearAll} className="bg-rose-500 text-white px-3 py-2 rounded-md hover:bg-rose-600 text-sm">{t.clearAll}</button>
        <button onClick={onNewPatient} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          {t.newPatient}
        </button>
      </div>
    </div>
    {loading ? (
      <p>Loading...</p>
    ) : encounters.length > 0 ? (
      <div className="space-y-3">
        {encounters.map((enc) => (
          <div key={enc.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 hover:bg-gray-100">
            <div>
              <p className="font-semibold text-blue-600">{enc.patientName}</p>
              <p className="text-sm text-gray-500">{t.age}: {enc.patientAge} | {new Date(enc.creationTimestamp).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center mt-3 md:mt-0 gap-2">
              <button onClick={() => onLoadEncounter(enc)} className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600">{t.loadEncounter}</button>
              <button onClick={() => onRequestDelete(enc.id)} className="bg-red-500 text-white px-3 py-1 text-sm rounded-md hover:bg-red-600">{t.deleteEncounter}</button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-500 py-8">{t.noEncounters}</p>
    )}
  </div>
);

const NewPatientPage = ({ onCreateRecord, t }) => {
  const [pd, setPD] = useState({ patientName: "", patientAge: "", patientSex: "Masculino", vitals_FC: "", vitals_FR: "", vitals_TA: "", vitals_Temp: "", vitals_SatO2: "" });
  const handleChange = (e) => setPD((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-gray-700">{t.patientInfo}</h2>
      <form onSubmit={(e) => { e.preventDefault(); onCreateRecord(pd); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600">{t.patientName}</label>
            <input name="patientName" value={pd.patientName} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">{t.age}</label>
            <input type="number" name="patientAge" value={pd.patientAge} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">{t.sex}</label>
          <select name="patientSex" value={pd.patientSex} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white">
            <option value="Masculino">{t.male}</option>
            <option value="Femenino">{t.female}</option>
            <option value="Otro">{t.other}</option>
          </select>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.vitalSigns}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <input name="vitals_FC" placeholder={t.fc} value={pd.vitals_FC} onChange={handleChange} className="p-2 border rounded-md" />
            <input name="vitals_FR" placeholder={t.fr} value={pd.vitals_FR} onChange={handleChange} className="p-2 border rounded-md" />
            <input name="vitals_TA" placeholder={t.ta} value={pd.vitals_TA} onChange={handleChange} className="p-2 border rounded-md" />
            <input name="vitals_Temp" placeholder={t.temp} value={pd.vitals_Temp} onChange={handleChange} className="p-2 border rounded-md" />
            <input name="vitals_SatO2" placeholder={t.sato2} value={pd.vitals_SatO2} onChange={handleChange} className="p-2 border rounded-md" />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700">{t.createRecord}</button>
      </form>
    </div>
  );
};

const PatientHeader = memo(({ encounter, t }) => (
  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
      <div><span className="font-semibold">{t.patientName}:</span> {encounter.patientName}</div>
      <div><span className="font-semibold">{t.age}:</span> {encounter.patientAge}</div>
      <div><span className="font-semibold">{t.sex}:</span> {encounter.patientSex}</div>
      <div><span className="font-semibold">{t.fc}:</span> {encounter.vitals_FC}</div>
      <div><span className="font-semibold">{t.fr}:</span> {encounter.vitals_FR}</div>
      <div><span className="font-semibold">{t.ta}:</span> {encounter.vitals_TA}</div>
      <div><span className="font-semibold">{t.temp}:</span> {encounter.vitals_Temp}</div>
      <div><span className="font-semibold">{t.sato2}:</span> {encounter.vitals_SatO2}</div>
    </div>
  </div>
));

// Explicit display name for memoized component
PatientHeader.displayName = 'PatientHeader';

const BigTextArea = memo(({ label, name, value, onChange }) => (
  <div>
    <label className="text-lg font-semibold text-gray-700">{label}</label>
    <textarea name={name} value={value} onChange={onChange} rows={8} className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
  </div>
));

// Explicit display name for memoized component
BigTextArea.displayName = 'BigTextArea';

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border rounded-lg mb-2">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 text-left bg-gray-100 hover:bg-gray-200 flex justify-between items-center font-semibold">
        {title}
        <svg className={`w-5 h-5 transform transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

// Display name for debugging and eslint
AccordionItem.displayName = 'AccordionItem';

// Fixed A4 width for stable slicing (~794px @ 96dpi)
const PDFLayout = ({ innerRef, encounter, studentInfo, t }) => (
  <div ref={innerRef} className="bg-white p-8" style={{ width: "794px" }}>
    <h1 className="text-2xl font-bold text-center mb-2">{t.appName}</h1>
    <p className="text-sm text-center text-gray-500 mb-6">Expediente Clínico Electrónico</p>
    <div className="mb-6 p-4 border rounded-lg">
      <h2 className="font-bold text-lg mb-2 border-b pb-1">{t.studentHeader}</h2>
      <p><span className="font-semibold">{t.studentName}:</span> {studentInfo.name}</p>
      <p><span className="font-semibold">{t.studentId}:</span> {studentInfo.id}</p>
    </div>
    <div className="mb-6 p-4 border rounded-lg">
      <h2 className="font-bold text-lg mb-2 border-b pb-1">{t.patientHeader}</h2>
      <div className="grid grid-cols-2 gap-2">
        <p><span className="font-semibold">{t.patientName}:</span> {encounter.patientName}</p>
        <p><span className="font-semibold">{t.age}:</span> {encounter.patientAge}</p>
        <p><span className="font-semibold">{t.sex}:</span> {encounter.patientSex}</p>
        <p><span className="font-semibold">{t.timestampHeader}:</span> {new Date(encounter.creationTimestamp).toLocaleString()}</p>
      </div>
    </div>
    <div className="mb-6 p-4 border rounded-lg">
      <h2 className="font-bold text-lg mb-2 border-b pb-1">{t.vitalSigns}</h2>
      <div className="grid grid-cols-3 gap-2">
        <p><span className="font-semibold">{t.fc}:</span> {encounter.vitals_FC}</p>
        <p><span className="font-semibold">{t.fr}:</span> {encounter.vitals_FR}</p>
        <p><span className="font-semibold">{t.ta}:</span> {encounter.vitals_TA}</p>
        <p><span className="font-semibold">{t.temp}:</span> {encounter.vitals_Temp}</p>
        <p><span className="font-semibold">{t.sato2}:</span> {encounter.vitals_SatO2}</p>
      </div>
    </div>
    <div className="space-y-4">
      <div className="p-4 border rounded-lg"><h3 className="font-bold text-lg mb-2 border-b pb-1">{t.subjective}</h3><p className="text-gray-700 whitespace-pre-wrap break-words">{encounter.soap_S || "N/A"}</p></div>
      <div className="p-4 border rounded-lg"><h3 className="font-bold text-lg mb-2 border-b pb-1">{t.objective}</h3><p className="text-gray-700 whitespace-pre-wrap break-words">{encounter.soap_O || "N/A"}</p></div>
      <div className="p-4 border rounded-lg"><h3 className="font-bold text-lg mb-2 border-b pb-1">{t.analysis}</h3><p className="text-gray-700 whitespace-pre-wrap break-words">{encounter.soap_A || "N/A"}</p></div>
      <div className="p-4 border rounded-lg"><h3 className="font-bold text-lg mb-2 border-b pb-1">{t.plan}</h3><p className="text-gray-700 whitespace-pre-wrap break-words">{encounter.soap_P || "N/A"}</p></div>
      <div className="p-4 border rounded-lg">
        <h3 className="font-bold text-lg mb-2 border-b pb-1">{t.requests}</h3>
        <div className="pl-4">
          <h4 className="font-semibold mt-2">{t.labs}</h4>
          <p className="text-gray-700 whitespace-pre-wrap break-words">{encounter.requests_Labs || "N/A"}</p>
          <h4 className="font-semibold mt-2">{t.imaging}</h4>
          <p className="text-gray-700 whitespace-pre-wrap break-words">{encounter.requests_Imaging || "N/A"}</p>
          <h4 className="font-semibold mt-2">{t.referrals}</h4>
          <p className="text-gray-700 whitespace-pre-wrap break-words">{encounter.requests_Refs || "N/A"}</p>
        </div>
      </div>
    </div>
  </div>
);

// Display name for eslint/debugging
PDFLayout.displayName = 'PDFLayout';

const EMRPage = ({ encounter, setEncounter, studentInfo, onSave, onExport, isSaving, isExporting, onBack, t }) => {
  const [activeTab, setActiveTab] = useState("soap");
  const handleChange = (e) => setEncounter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  if (!encounter) return <p>Loading...</p>;
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <PatientHeader encounter={encounter} t={t} />
      <div className="mb-4 border-b">
        <nav className="-mb-px flex gap-6">
          <button onClick={() => setActiveTab("soap")} className={`py-3 px-1 border-b-2 text-sm ${activeTab === "soap" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>{t.soapNote}</button>
          <button onClick={() => setActiveTab("requests")} className={`py-3 px-1 border-b-2 text-sm ${activeTab === "requests" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>{t.requests}</button>
        </nav>
      </div>
      {activeTab === "soap" && (
        <div className="space-y-6">
          <BigTextArea label={t.subjective} name="soap_S" value={encounter.soap_S} onChange={handleChange} />
          <BigTextArea label={t.objective} name="soap_O" value={encounter.soap_O} onChange={handleChange} />
          <BigTextArea label={t.analysis} name="soap_A" value={encounter.soap_A} onChange={handleChange} />
          <BigTextArea label={t.plan} name="soap_P" value={encounter.soap_P} onChange={handleChange} />
        </div>
      )}
      {activeTab === "requests" && (
        <div>
          <AccordionItem title={t.labs}><BigTextArea label="" name="requests_Labs" value={encounter.requests_Labs} onChange={handleChange} /></AccordionItem>
          <AccordionItem title={t.imaging}><BigTextArea label="" name="requests_Imaging" value={encounter.requests_Imaging} onChange={handleChange} /></AccordionItem>
          <AccordionItem title={t.referrals}><BigTextArea label="" name="requests_Refs" value={encounter.requests_Refs} onChange={handleChange} /></AccordionItem>
        </div>
      )}
      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <button onClick={onBack} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">{t.backToList}</button>
        <button onClick={onSave} disabled={isSaving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{isSaving ? t.saving : t.save}</button>
        <button onClick={onExport} disabled={isExporting} className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-teal-300">{isExporting ? t.exporting : t.exportPDF}</button>
      </div>
    </div>
  );
};

// Display name for eslint/debugging
EMRPage.displayName = 'EMRPage';

/*****************
 * Minimal in-app problem solvers (no external runner required)
 *****************/
(function runLocalTestsOnce() {
  try {
    if (typeof window === 'undefined') return; // only in browser
    if (window.__UNIBE_LOCAL_TESTS__) return; // prevent re-run on HMR
    window.__UNIBE_LOCAL_TESTS__ = true;

    // Test 1: translation fallback
    const tx = getT('xx');
    if (!tx || !tx.appName) throw new Error('Translation fallback failed');

    // Test 2: local storage CRUD
    const sid = '__TEST_STUDENT__';
    clearLocal(sid);
    const a = { id: '1', patientName: 'A' };
    const b = { id: '2', patientName: 'B' };
    let list = upsertLocal(sid, a);
    if (list.length !== 1) throw new Error('Upsert #1 failed');
    list = upsertLocal(sid, b);
    if (list.length !== 2) throw new Error('Upsert #2 failed');
    list = upsertLocal(sid, { ...a, patientName: 'A2' });
    if (list.length !== 2 || list.find(x => x.id==='1').patientName !== 'A2') throw new Error('Upsert update failed');
    list = deleteLocal(sid, '1');
    if (list.length !== 1 || list[0].id !== '2') throw new Error('Delete failed');
    clearLocal(sid);

    // Test 3: canExport guard
    if (canExportGuard('login', {id:'x'})) throw new Error('canExport guard failed (login)');
    if (canExportGuard('newPatient', {id:'x'})) throw new Error('canExport guard failed (newPatient)');
    if (canExportGuard('emr', null)) throw new Error('canExport guard failed (null encounter)');
    if (!canExportGuard('emr', {id:'x'})) throw new Error('canExport guard failed (emr+encounter)');

    // Test 4: filename sanitization
    if (sanitizeFilename('J. Doe / 01').indexOf('/') !== -1) throw new Error('Filename not sanitized');
    if (sanitizeFilename('Paciente *?<>:"|').match(/[*?<>":|]/)) throw new Error('Filename bad chars not stripped');

    // Test 5: clearAll semantics
    const sid2 = '__TEST_STUDENT_2__';
    upsertLocal(sid2, { id: 'a', patientName: 'X' });
    upsertLocal(sid2, { id: 'b', patientName: 'Y' });
    if (loadLocal(sid2).length !== 2) throw new Error('Setup for clearAll failed');
    clearLocal(sid2);
    if (loadLocal(sid2).length !== 0) throw new Error('clearLocal did not empty list');

    // Test 6: isValidPdfRoot utility
    const div = document.createElement('div');
    if (!isValidPdfRoot(div)) throw new Error('isValidPdfRoot false for div');
    if (isValidPdfRoot(null)) throw new Error('isValidPdfRoot true for null');

    console.info(getT('en').testsPassed);
  } catch (e) {
    console.error(getT('en').testsFailed, e);
  }
})();
