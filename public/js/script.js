// JavaScript untuk fitur tambahan dan animasi
document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide alert setelah 5 detik
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
    
    // ========== KONFIRMASI UNTUK CREATE (TAMBAH DATA) ==========
    const createForms = document.querySelectorAll('form[action*="/barang"], form[action*="/pemasukan"], form[action*="/pengeluaran"]');
    createForms.forEach(form => {
        // Skip form yang untuk edit/delete
        if (form.action.includes('edit') || form.action.includes('delete')) {
            return;
        }
        
        form.addEventListener('submit', function(e) {
            // Cek apakah form memiliki method POST (untuk create)
            if (this.method.toLowerCase() === 'post') {
                const formType = this.action.includes('barang') ? 'stok barang' :
                               this.action.includes('pemasukan') ? 'pemasukan' : 'pengeluaran';
                
                if (!confirm(`Apakah Anda yakin ingin menambahkan data ${formType} ini?`)) {
                    e.preventDefault();
                }
            }
        });
    });

    // ========== KONFIRMASI UNTUK UPDATE (EDIT DATA) ==========
    const editForms = document.querySelectorAll('form[action*="edit"]');
    editForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Apakah Anda yakin ingin mengupdate data ini?')) {
                e.preventDefault();
            }
        });
    });

    // ========== KONFIRMASI UNTUK DELETE (HAPUS DATA) ==========
    const deleteForms = document.querySelectorAll('form[action*="delete"]');
    deleteForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                e.preventDefault();
            }
        });
    });

    // ========== KONFIRMASI KHUSUS UNTUK DELETE BUTTON ==========
    const deleteButtons = document.querySelectorAll('.btn-danger[type="submit"]');
    deleteButtons.forEach(button => {
        const form = button.closest('form');
        if (form && form.action.includes('delete')) {
            button.addEventListener('click', function(e) {
                if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    });

    // Smooth scroll untuk anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add subtle animation to cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards for animation
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Form validation enhancement
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Skip forms yang sudah memiliki validation
        if (form.querySelector('[required]')) {
            form.addEventListener('submit', function(e) {
                const requiredFields = this.querySelectorAll('[required]');
                let valid = true;

                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        field.style.borderColor = '#e74c3c';
                        valid = false;
                    } else {
                        field.style.borderColor = '';
                    }
                });

                if (!valid) {
                    e.preventDefault();
                    alert('Harap lengkapi semua field yang wajib diisi!');
                }
            });
        }
    });
});

// Utility function for number formatting
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

// Price formatting for tables
document.addEventListener('DOMContentLoaded', function() {
    const priceElements = document.querySelectorAll('[data-price]');
    priceElements.forEach(element => {
        const price = element.getAttribute('data-price');
        if (price) {
            element.textContent = 'Rp ' + formatNumber(price);
        }
    });
});