import React, { useState, useEffect } from 'react';

// GANTI INI dengan URL Web App Google Apps Script kamu
const GAS_URL = "URL_WEB_APP_GOOGLE_SCRIPT_KAMU";

interface User {
  nama: string;
  role: string;
}

interface Book {
  id: string | number;
  judul: string;
  penulis: string;
  kategori: string;
  stok: number;
  status: string;
}

interface BorrowingHistory {
  id: string | number;
  peminjam: string;
  tanggalPinjam: string;
  tanggalKembali: string | null;
  status: 'Dipinjam' | 'Dikembalikan';
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>({ nama: '', role: '' });
  const [activeTab, setActiveTab] = useState('mhs');
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // History states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedBookHistory, setSelectedBookHistory] = useState<BorrowingHistory[]>([]);
  const [selectedBookTitle, setSelectedBookTitle] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ nim: '', nama: '', user: '', pass: '' });
  const [newBook, setNewBook] = useState({ judul: '', penulis: '', kategori: 'Teknik Informatika', stok: 1 });

  // Fetch books on login
  useEffect(() => {
    if (isLoggedIn) {
      fetchBooks();
    }
  }, [isLoggedIn]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Note: This will likely fail with the placeholder URL. 
      // In a real scenario, ensure GAS_URL is correct.
      if (GAS_URL === "URL_WEB_APP_GOOGLE_SCRIPT_KAMU") {
         // Mock data for demonstration if URL is not set
         const mockBooks: Book[] = [
             { id: 1, judul: "Pemrograman Web Modern", penulis: "Eko Kurniawan", kategori: "Teknik Informatika", stok: 5, status: "Tersedia" },
             { id: 2, judul: "Algoritma & Struktur Data", penulis: "Rinaldi Munir", kategori: "Teknik Informatika", stok: 3, status: "Tersedia" },
             { id: 3, judul: "Metodologi Penelitian", penulis: "Sugiyono", kategori: "Umum", stok: 0, status: "Dipinjam" },
             { id: 4, judul: "Fiqih Muamalah", penulis: "Wahbah Az-Zuhaili", kategori: "Pendidikan Agama Islam", stok: 2, status: "Tersedia" },
         ];
         // Simulate network delay
         await new Promise(resolve => setTimeout(resolve, 1000));
         setBooks(mockBooks);
         setFilteredBooks(mockBooks);
         setLoading(false);
         return;
      }

      const res = await fetch(GAS_URL);
      const data = await res.json();
      setBooks(data);
      setFilteredBooks(data);
    } catch (error) {
      console.error("Gagal memuat data buku");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (bookId: string | number, bookTitle: string) => {
    setSelectedBookTitle(bookTitle);
    setShowHistoryModal(true);
    setHistoryLoading(true);

    try {
      if (GAS_URL === "URL_WEB_APP_GOOGLE_SCRIPT_KAMU") {
        await new Promise(resolve => setTimeout(resolve, 800));
        // Mock history data
        const mockHistory: BorrowingHistory[] = [
          { id: 1, peminjam: "Ahmad Dahlan (2023001)", tanggalPinjam: "2023-10-01", tanggalKembali: "2023-10-08", status: 'Dikembalikan' },
          { id: 2, peminjam: "Siti Aminah (2023045)", tanggalPinjam: "2023-11-15", tanggalKembali: null, status: 'Dipinjam' },
          { id: 3, peminjam: "Budi Santoso (2023012)", tanggalPinjam: "2023-09-20", tanggalKembali: "2023-09-27", status: 'Dikembalikan' },
        ];
        // Randomize history for demo purposes based on bookId
        const randomHistory = mockHistory.filter(() => Math.random() > 0.3);
        setSelectedBookHistory(randomHistory);
        setHistoryLoading(false);
        return;
      }

      const res = await fetch(`${GAS_URL}?type=history&bookId=${bookId}`);
      const data = await res.json();
      setSelectedBookHistory(data);
    } catch (error) {
      console.error("Gagal memuat riwayat");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginMsg('');
    
    let payload: any = { type: activeTab === 'mhs' ? 'login_mhs' : 'login_admin' };
    if (activeTab === 'mhs') {
      payload.nim = loginForm.nim;
      payload.nama = loginForm.nama;
    } else {
      payload.user = loginForm.user;
      payload.pass = loginForm.pass;
    }

    try {
      // Mock login for demonstration if URL is placeholder
      if (GAS_URL === "URL_WEB_APP_GOOGLE_SCRIPT_KAMU") {
          await new Promise(resolve => setTimeout(resolve, 1000));
          if ((activeTab === 'mhs' && loginForm.nim) || (activeTab === 'admin' && loginForm.user === 'admin')) {
             setUser({ 
                 nama: activeTab === 'mhs' ? loginForm.nama || 'Mahasiswa' : 'Administrator', 
                 role: activeTab === 'mhs' ? 'mahasiswa' : 'admin' 
             });
             setIsLoggedIn(true);
          } else {
             setLoginMsg('Login Gagal! Data tidak cocok. (Gunakan "admin" untuk user admin)');
          }
          setLoginLoading(false);
          return;
      }

      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.status === 'success') {
        setUser({ nama: data.nama, role: data.role });
        setIsLoggedIn(true);
      } else {
        setLoginMsg('Login Gagal! Data tidak cocok.');
      }
    } catch (error) {
      setLoginMsg('Terjadi kesalahan koneksi.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = books.filter(b => 
      b.judul.toLowerCase().includes(term) || 
      b.penulis.toLowerCase().includes(term) ||
      b.kategori.toLowerCase().includes(term)
    );
    setFilteredBooks(filtered);
  };

  const saveBook = async () => {
    const payload = { type: 'add_book', ...newBook };
    setLoading(true);
    
    if (GAS_URL === "URL_WEB_APP_GOOGLE_SCRIPT_KAMU") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newId = books.length + 1;
        const bookToAdd: Book = { ...newBook, id: newId, status: 'Tersedia' };
        const updatedBooks = [...books, bookToAdd];
        setBooks(updatedBooks);
        setFilteredBooks(updatedBooks);
        setShowAddModal(false);
        setNewBook({ judul: '', penulis: '', kategori: 'Teknik Informatika', stok: 1 });
        setLoading(false);
        return;
    }

    await fetch(GAS_URL, { method: 'POST', body: JSON.stringify(payload) });
    setShowAddModal(false);
    setNewBook({ judul: '', penulis: '', kategori: 'Teknik Informatika', stok: 1 });
    fetchBooks();
  };

  const deleteBook = async (id: string | number) => {
    if (!window.confirm('Hapus buku ini secara permanen?')) return;
    setLoading(true);

    if (GAS_URL === "URL_WEB_APP_GOOGLE_SCRIPT_KAMU") {
        await new Promise(resolve => setTimeout(resolve, 500));
        const updatedBooks = books.filter(b => b.id !== id);
        setBooks(updatedBooks);
        setFilteredBooks(updatedBooks);
        setLoading(false);
        return;
    }

    await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ type: 'delete_book', id }) });
    fetchBooks();
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-green-900 px-4">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-green-700 to-green-900 p-10 text-center text-white">
            <div className="inline-block bg-white/20 p-4 rounded-full mb-4">
              <i className="fas fa-university text-4xl"></i>
            </div>
            <h2 className="text-2xl font-black">SmartBook UNUGHA</h2>
            <p className="text-green-100 text-xs opacity-80 uppercase tracking-widest font-semibold">Digital Library Portal</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 m-6 rounded-2xl">
            <button 
              onClick={() => { setActiveTab('mhs'); setLoginMsg(''); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'mhs' ? 'bg-white shadow-sm text-green-700' : 'text-slate-500'}`}
            >
              MAHASISWA
            </button>
            <button 
              onClick={() => { setActiveTab('admin'); setLoginMsg(''); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'admin' ? 'bg-white shadow-sm text-yellow-700' : 'text-slate-500'}`}
            >
              ADMIN
            </button>
          </div>

          <div className="p-8 pt-0">
            {activeTab === 'mhs' ? (
              <div className="space-y-4">
                <input 
                  type="text" placeholder="NIM Mahasiswa" 
                  value={loginForm.nim} onChange={e => setLoginForm({...loginForm, nim: e.target.value})}
                  className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-green-500 outline-none" 
                />
                <input 
                  type="text" placeholder="Nama Lengkap" 
                  value={loginForm.nama} onChange={e => setLoginForm({...loginForm, nama: e.target.value})}
                  className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-green-500 outline-none" 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Username" 
                  value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})}
                  className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-yellow-500 outline-none" 
                />
                <input 
                  type="password" placeholder="Password" 
                  value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
                  className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-yellow-500 outline-none" 
                />
              </div>
            )}
            
            <p className="text-red-500 text-[10px] mt-4 text-center font-bold uppercase min-h-[1.5rem]">{loginMsg}</p>
            <button 
              onClick={handleLogin}
              disabled={loginLoading}
              className={`w-full mt-4 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 ${activeTab === 'mhs' ? 'bg-green-700 hover:bg-green-800' : 'bg-yellow-600 hover:bg-yellow-700'}`}
            >
              {loginLoading ? 'MEMPROSES...' : 'MASUK SEKARANG'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-700 text-white p-2.5 rounded-xl"><i className="fas fa-book-reader"></i></div>
            <div>
              <h1 className="font-black text-green-800 text-lg leading-none">SmartBook</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">UNUGHA Cilacap</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none">{user.nama}</p>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{user.role}</p>
            </div>
            <button onClick={() => window.location.reload()} className="bg-slate-100 hover:bg-red-500 hover:text-white w-10 h-10 rounded-full transition-all flex items-center justify-center">
              <i className="fas fa-power-off"></i>
            </button>
          </div>
        </div>
      </header>

      {user.role === 'admin' && (
        <div className="bg-yellow-400 py-3 shadow-inner">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <span className="text-xs font-black text-yellow-900 uppercase"><i className="fas fa-user-shield mr-2"></i> Admin Panel</span>
            <button onClick={() => setShowAddModal(true)} className="bg-white text-yellow-700 text-[10px] font-black px-4 py-2 rounded-lg shadow-sm hover:bg-yellow-50">
              <i className="fas fa-plus mr-1"></i> TAMBAH BUKU
            </button>
          </div>
        </div>
      )}

      <section className="bg-green-800 py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black text-white mb-2">Perpustakaan Pintar</h2>
          <p className="text-green-200 text-sm mb-8">Temukan koleksi referensi akademik digital</p>
          <div className="relative">
            <input 
              type="text" value={searchTerm} onChange={handleSearch}
              placeholder="Cari judul, penulis, atau kategori..." 
              className="w-full p-5 pl-14 rounded-2xl shadow-2xl focus:ring-4 focus:ring-white/20 outline-none text-slate-700 text-lg" 
            />
            <i className="fas fa-search absolute left-5 top-6 text-slate-300 text-xl"></i>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 flex-grow">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block border-4 border-t-green-700 rounded-full h-10 w-10 animate-spin mb-2"></div>
            <p className="text-slate-400 text-xs font-bold uppercase">Memuat Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <span className="text-[9px] font-black text-green-700 bg-green-50 px-3 py-1 rounded-full uppercase border border-green-100 tracking-tighter">{book.kategori}</span>
                    <span className={`text-[9px] font-bold ${book.status === 'Tersedia' ? 'text-blue-500' : 'text-red-500'} italic flex items-center gap-1 uppercase tracking-tighter`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${book.status === 'Tersedia' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`}></span> {book.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 leading-tight mb-2 text-lg">{book.judul}</h3>
                  <p className="text-xs text-slate-400 mb-6 font-semibold italic">{book.penulis}</p>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button className="flex-1 bg-green-700 text-white text-[10px] font-black py-4 rounded-2xl hover:bg-green-800 transition-all shadow-md shadow-green-900/10 uppercase">Pinjam</button>
                  {user.role === 'admin' && (
                    <>
                      <button onClick={() => fetchHistory(book.id, book.judul)} className="bg-blue-50 text-blue-500 w-12 rounded-2xl hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center" title="Riwayat Peminjaman">
                        <i className="fas fa-history text-sm"></i>
                      </button>
                      <button onClick={() => deleteBook(book.id)} className="bg-red-50 text-red-500 w-12 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center" title="Hapus Buku">
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL RIWAYAT PEMINJAMAN */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 italic">Riwayat Peminjaman</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{selectedBookTitle}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center transition-all">
                <i className="fas fa-times text-slate-500"></i>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
              {historyLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block border-4 border-t-blue-500 rounded-full h-8 w-8 animate-spin mb-2"></div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Memuat Riwayat...</p>
                </div>
              ) : selectedBookHistory.length > 0 ? (
                <div className="space-y-3">
                  {selectedBookHistory.map((hist) => (
                    <div key={hist.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{hist.peminjam}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-[10px] text-slate-400 font-semibold"><i className="fas fa-calendar-alt mr-1"></i> Pinjam: {hist.tanggalPinjam}</span>
                          {hist.tanggalKembali && (
                            <span className="text-[10px] text-slate-400 font-semibold"><i className="fas fa-check-circle mr-1"></i> Kembali: {hist.tanggalKembali}</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${hist.status === 'Dipinjam' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                        {hist.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <i className="fas fa-history text-4xl text-slate-200 mb-2"></i>
                  <p className="text-slate-400 text-xs font-bold">Belum ada riwayat peminjaman</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BUKU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-6 text-center italic">Tambah Koleksi</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Judul Buku" value={newBook.judul} onChange={e => setNewBook({...newBook, judul: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-green-600" />
              <input type="text" placeholder="Penulis" value={newBook.penulis} onChange={e => setNewBook({...newBook, penulis: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-green-600" />
              <select value={newBook.kategori} onChange={e => setNewBook({...newBook, kategori: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none bg-slate-50">
                <option>Teknik Informatika</option>
                <option>Pendidikan Agama Islam</option>
                <option>Ekonomi & Bisnis</option>
                <option>Umum</option>
              </select>
              <input type="number" placeholder="Stok" value={newBook.stok} onChange={e => setNewBook({...newBook, stok: Number(e.target.value)})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-green-600" />
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold text-slate-400">BATAL</button>
              <button onClick={saveBook} className="flex-1 bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-900/20">SIMPAN</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        &copy; 2026 UNUGHA Cilacap - Smart Library React
      </footer>
    </div>
  );
}
