import React, { useState, useEffect } from 'react';
import { Camera, X, Zap, ZapOff, Check, ChevronLeft, Edit2, Image as ImageIcon, Plus, Building2, Globe, Mail, Phone, MapPin, Tag, FileText, Loader2 } from 'lucide-react';

type Company = {
  id: string;
  name: string;
  website: string;
  emails: string;
  phones: string;
  country: string;
  city: string;
  booth: string;
  categories: string[];
  notes: string;
  status: 'Saved' | 'Processing' | 'Draft';
  timestamp: string;
  thumbnail: string;
  photos: string[];
};

const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Acme Corp',
    website: 'acme.com',
    emails: 'contact@acme.com',
    phones: '+1 234 567 890',
    country: 'USA',
    city: 'New York',
    booth: 'A12',
    categories: ['Hardware', 'AI'],
    notes: 'Interesting new product line.',
    status: 'Saved',
    timestamp: '10:30 AM',
    thumbnail: 'https://picsum.photos/seed/acme/100/100',
    photos: ['https://picsum.photos/seed/acme1/400/300', 'https://picsum.photos/seed/acme2/400/300']
  },
  {
    id: '2',
    name: 'Global Industries',
    website: 'global-ind.net',
    emails: 'info@global-ind.net',
    phones: '+44 20 7946 0958',
    country: 'UK',
    city: 'London',
    booth: 'B05',
    categories: ['Manufacturing'],
    notes: 'Follow up next week.',
    status: 'Saved',
    timestamp: 'Yesterday',
    thumbnail: 'https://picsum.photos/seed/global/100/100',
    photos: ['https://picsum.photos/seed/global1/400/300']
  }
];

function HomeScreen({ companies, onStartScan, onSelectCompany }: { companies: Company[], onStartScan: () => void, onSelectCompany: (c: Company) => void }) {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="px-5 py-4 bg-white text-slate-900 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <h1 className="text-xl font-semibold tracking-tight">Expo Scanner</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <Camera size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Scan New Company</h2>
            <p className="text-sm text-slate-500 mt-1">Take photos of logo, products, QR or website</p>
          </div>
          <button 
            onClick={onStartScan}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3.5 font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus size={20} />
            Start Scan
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-500 px-1">Recent Scans</h3>
          {companies.map(company => (
            <div 
              key={company.id} 
              onClick={() => onSelectCompany(company)}
              className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <img src={company.thumbnail} alt={company.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-slate-900 truncate pr-2">{company.name}</h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap mt-0.5">{company.timestamp}</span>
                </div>
                <p className="text-sm text-slate-500 truncate">{company.website}</p>
                <div className="mt-1">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    company.status === 'Saved' ? 'bg-green-100 text-green-700' : 
                    company.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {company.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function CameraScreen({ onClose, onFinish, capturedPhotos, onCapture }: { onClose: () => void, onFinish: () => void, capturedPhotos: string[], onCapture: () => void }) {
  const [flash, setFlash] = useState(false);

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="flex justify-between items-center p-4 z-10">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full backdrop-blur-md active:bg-white/20 transition-colors">
          <X size={24} />
        </button>
        <button onClick={() => setFlash(!flash)} className="p-2 bg-white/10 rounded-full backdrop-blur-md active:bg-white/20 transition-colors">
          {flash ? <Zap size={24} className="text-yellow-400" /> : <ZapOff size={24} />}
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <Camera size={48} className="text-white/10" />
        </div>
        <div className="absolute inset-8 border-2 border-white/20 rounded-3xl pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl -mt-0.5 -ml-0.5"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl -mt-0.5 -mr-0.5"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl -mb-0.5 -ml-0.5"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl -mb-0.5 -mr-0.5"></div>
        </div>
      </div>

      <div className="pb-8 pt-4 px-4 bg-black/90 backdrop-blur-xl flex flex-col gap-6">
        <div className="h-16 flex gap-2 overflow-x-auto snap-x px-2">
          {capturedPhotos.map((photo, i) => (
            <img key={i} src={photo} className="h-16 w-16 rounded-xl object-cover border border-white/20 snap-center shrink-0" alt="Captured" referrerPolicy="no-referrer" />
          ))}
          {capturedPhotos.length === 0 && (
            <div className="h-16 w-16 rounded-xl border border-white/20 border-dashed flex items-center justify-center text-white/40 text-xs text-center p-1 shrink-0">
              No photos
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="w-24"></div>
          
          <button 
            onClick={onCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>

          <div className="w-24 flex justify-end">
            {capturedPhotos.length > 0 && (
              <button 
                onClick={onFinish}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-full font-medium text-sm flex items-center gap-1.5 active:bg-blue-700 transition-colors"
              >
                Finish <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessingScreen({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setState(2), 2000);
    const t2 = setTimeout(() => setState(3), 4500);
    const t3 = setTimeout(() => onComplete(), 6000);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 5, 100));
    }, 100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center">
      <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
        {state === 1 && (
          <div className="w-full h-full rounded-full border-4 border-slate-100 flex items-center justify-center">
            <ImageIcon size={32} className="text-blue-500 animate-pulse" />
          </div>
        )}
        {state === 2 && (
          <div className="absolute inset-0">
            <Loader2 size={96} className="text-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={32} className="text-blue-600" />
            </div>
          </div>
        )}
        {state === 3 && (
          <div className="absolute inset-0">
            <Loader2 size={96} className="text-green-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Check size={32} className="text-green-500" />
            </div>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold text-slate-900 mb-2">
        {state === 1 && "Uploading Photos"}
        {state === 2 && "Analyzing with AI"}
        {state === 3 && "Saving Company"}
      </h2>
      
      <p className="text-slate-500 mb-8">
        {state === 1 && "Sending images to your server"}
        {state === 2 && "Processing with Gemini API"}
        {state === 3 && "Storing extracted information"}
      </p>

      {state === 1 && (
        <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

function FormField({ icon, label, value, className = "" }: { icon?: React.ReactNode, label: string, value: string, className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <input 
        type="text" 
        defaultValue={value}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
      />
    </div>
  );
}

function ReviewScreen({ company, onSave, onEditPhotos }: { company: Company, onSave: () => void, onEditPhotos: () => void }) {
  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="px-4 py-4 bg-white text-slate-900 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100 shadow-sm">
        <h1 className="text-lg font-semibold">Review Details</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
          <img src={company.thumbnail} alt="Logo" className="w-16 h-16 rounded-xl object-cover bg-slate-100" referrerPolicy="no-referrer" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{company.name}</h2>
            <p className="text-slate-500 flex items-center gap-1 mt-1 text-sm">
              <Globe size={14} /> {company.website}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <FormField icon={<Building2 size={16} />} label="Company Name" value={company.name} />
          <FormField icon={<Globe size={16} />} label="Website" value={company.website} />
          <FormField icon={<Mail size={16} />} label="Emails" value={company.emails} />
          <FormField icon={<Phone size={16} />} label="Phones" value={company.phones} />
          <div className="flex gap-4">
            <FormField icon={<MapPin size={16} />} label="Country" value={company.country} className="flex-1" />
            <FormField label="City" value={company.city} className="flex-1" />
          </div>
          <FormField label="Booth" value={company.booth} />
          
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Tag size={16} /> Product Categories
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {company.categories.map((cat, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                  {cat}
                </span>
              ))}
              <button className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 border-dashed flex items-center gap-1 active:bg-slate-100">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
              <FileText size={16} /> Notes
            </label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              rows={3}
              defaultValue={company.notes}
            ></textarea>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-8 sm:pb-4 flex gap-3 z-20">
        <button 
          onClick={onEditPhotos}
          className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-medium active:bg-slate-200 transition-colors"
        >
          Edit Photos
        </button>
        <button 
          onClick={onSave}
          className="flex-[2] bg-blue-600 text-white py-3.5 rounded-2xl font-medium active:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
        >
          Save Company
        </button>
      </div>
    </div>
  );
}

function DetailScreen({ company, onBack }: { company: Company, onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="px-2 py-3 bg-white text-slate-900 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold truncate px-2">{company.name}</h1>
        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
          <Edit2 size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-12">
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <img src={company.thumbnail} alt="Logo" className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-slate-100" referrerPolicy="no-referrer" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{company.name}</h2>
            <a href={`https://${company.website}`} className="text-blue-600 font-medium flex items-center justify-center gap-1 mt-1">
              <Globe size={16} /> {company.website}
            </a>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
              <MapPin size={14} /> {company.city}, {company.country}
            </span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">
              Booth {company.booth}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Mail size={18} /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Email</p>
                <p className="text-slate-900 font-medium">{company.emails}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Phone size={18} /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Phone</p>
                <p className="text-slate-900 font-medium">{company.phones}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Products</h3>
            <div className="flex flex-wrap gap-2">
              {company.categories.map((cat, i) => (
                <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  {cat}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {company.notes}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Photo Gallery</h3>
          <div className="grid grid-cols-2 gap-3">
            {company.photos.map((photo, i) => (
              <img key={i} src={photo} alt={`Gallery ${i}`} className="w-full h-32 object-cover rounded-2xl border border-slate-100" referrerPolicy="no-referrer" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'camera' | 'processing' | 'review' | 'detail'>('home');
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  const mockExtractedCompany: Company = {
    id: Date.now().toString(),
    name: 'TechNova Solutions',
    website: 'technova.io',
    emails: 'hello@technova.io',
    phones: '+44 20 7123 4567',
    country: 'UK',
    city: 'London',
    booth: 'C45',
    categories: ['SaaS', 'Cloud Infrastructure'],
    notes: 'Looking for enterprise partners. Spoke with Sarah (VP Sales).',
    status: 'Draft',
    timestamp: 'Just now',
    thumbnail: 'https://picsum.photos/seed/technova/100/100',
    photos: []
  };

  const handleStartScan = () => {
    setCapturedPhotos([]);
    setCurrentScreen('camera');
  };

  const handleCapture = () => {
    const newPhoto = `https://picsum.photos/seed/${Date.now()}/400/300`;
    setCapturedPhotos(prev => [...prev, newPhoto]);
  };

  const handleFinishScan = () => {
    setCurrentScreen('processing');
  };

  const handleProcessingComplete = () => {
    const newCompany = { ...mockExtractedCompany, photos: capturedPhotos, thumbnail: capturedPhotos[0] || mockExtractedCompany.thumbnail };
    setSelectedCompany(newCompany);
    setCurrentScreen('review');
  };

  const handleSaveCompany = () => {
    if (selectedCompany) {
      const saved = { ...selectedCompany, status: 'Saved' as const };
      setCompanies(prev => [saved, ...prev]);
      setSelectedCompany(saved);
      setCurrentScreen('detail');
    }
  };

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setCurrentScreen('detail');
  };

  const handleBackToHome = () => {
    setSelectedCompany(null);
    setCurrentScreen('home');
  };

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] bg-slate-50 overflow-hidden flex flex-col font-sans relative shadow-2xl sm:rounded-[2.5rem] sm:h-[850px] sm:my-8 border border-slate-200">
      {currentScreen === 'home' && (
        <HomeScreen 
          companies={companies} 
          onStartScan={handleStartScan} 
          onSelectCompany={handleSelectCompany} 
        />
      )}
      {currentScreen === 'camera' && (
        <CameraScreen 
          capturedPhotos={capturedPhotos}
          onCapture={handleCapture}
          onClose={handleBackToHome}
          onFinish={handleFinishScan}
        />
      )}
      {currentScreen === 'processing' && (
        <ProcessingScreen onComplete={handleProcessingComplete} />
      )}
      {currentScreen === 'review' && selectedCompany && (
        <ReviewScreen 
          company={selectedCompany}
          onSave={handleSaveCompany}
          onEditPhotos={() => setCurrentScreen('camera')}
        />
      )}
      {currentScreen === 'detail' && selectedCompany && (
        <DetailScreen 
          company={selectedCompany}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
}
