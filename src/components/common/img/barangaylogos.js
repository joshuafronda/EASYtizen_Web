// Import default logo
import defaultLogo from './Municipal.png';

// Import all barangay logos with correct filenames
import alalumLogo from './BARANGAYLOGO/Alalum.png';
import antipoloLogo from './BARANGAYLOGO/Antipolo.png';
import balimbingLogo from './BARANGAYLOGO/Balimbing.png';
import banabaLogo from './BARANGAYLOGO/Banaba.png';
import bayananLogo from './BARANGAYLOGO/Bayanan.png';
import danglayanLogo from './BARANGAYLOGO/Danglayan.png';
import delpilarLogo from './BARANGAYLOGO/Del Pilar.png';
import gelerangkawayanLogo from './BARANGAYLOGO/Galerang Kawayan.png';
import ilatnorthLogo from './BARANGAYLOGO/Ilat North.png';
import ilatsouthLogo from './BARANGAYLOGO/Ilat South.png';
import kainginLogo from './BARANGAYLOGO/Kaingin.png';
import laurelLogo from './BARANGAYLOGO/Laurel.png';
import malakingpookLogo from './BARANGAYLOGO/Malaking Pook.png';
import mataasnalupa from './BARANGAYLOGO/Mataas na Lupa.png';
import natunuannorthLogo from './BARANGAYLOGO/Natunuan North.png';
import natunuansouthLogo from './BARANGAYLOGO/Natunuan South.png';
import padrecastilloLogo from './BARANGAYLOGO/Padre Castillo.png';
import palsahinginLogo from './BARANGAYLOGO/Palsahingin.png';
import pilaLogo from './BARANGAYLOGO/Pila.png';
import poblacionLogo from './BARANGAYLOGO/Poblacion.png';
import pooknibanalLogo from './BARANGAYLOGO/Pook ni Banal.png';
import pooknikapitanLogo from './BARANGAYLOGO/Pook ni Kapitan.png';
import resplandorLogo from './BARANGAYLOGO/Resplandor.png';
import sambatLogo from './BARANGAYLOGO/Sambat.png';
import sanantonioLogo from './BARANGAYLOGO/San Antonio.png';
import sanmarianoLogo from './BARANGAYLOGO/San Mariano.png';
import sanmateoLogo from './BARANGAYLOGO/San Mateo.png';
import santaelenaLogo from './BARANGAYLOGO/Santa Elena.png';
import santoninoLogo from './BARANGAYLOGO/Santo Nino.png';

// Export the barangay logos mapping
export const barangayLogos = {
    'Alalum': alalumLogo,
    'Antipolo': antipoloLogo,
    'Balimbing': balimbingLogo,
    'Banaba': banabaLogo,
    'Bayanan': bayananLogo,
    'Danglayan': danglayanLogo,
    'Del Pilar': delpilarLogo,
    'Gelerang Kawayan': gelerangkawayanLogo,
    'Ilat North': ilatnorthLogo,
    'Ilat South': ilatsouthLogo,
    'Kaingin': kainginLogo,
    'Laurel': laurelLogo,
    'Malaking Pook': malakingpookLogo,
    'Mataas na Lupa': mataasnalupa,
    'Natunuan North': natunuannorthLogo,
    'Natunuan South': natunuansouthLogo,
    'Padre Castillo': padrecastilloLogo,
    'Palsahingin': palsahinginLogo,
    'Pila': pilaLogo,
    'Poblacion': poblacionLogo,
    'Pook ni Banal': pooknibanalLogo,
    'Pook ni Kapitan': pooknikapitanLogo,
    'Resplandor': resplandorLogo,
    'Sambat': sambatLogo,
    'San Antonio': sanantonioLogo,
    'San Mariano': sanmarianoLogo,
    'San Mateo': sanmateoLogo,
    'Santa Elena': santaelenaLogo,
    'Santo Niño': santoninoLogo,
    'default': defaultLogo
};

// Helper function to get the correct logo
export const getBarangayLogo = (barangayName) => {
    if (!barangayName) {
        console.log('No barangay name provided, using default logo');
        return barangayLogos.default;
    }
    
    const normalizedName = barangayName.trim();
    const logo = barangayLogos[normalizedName];
    
    if (logo) {
        console.log(`Found logo for ${normalizedName}`);
        return logo;
    } else {
        console.log(`No logo found for ${normalizedName}, using default`);
        return barangayLogos.default;
    }
};

export const getAllBarangayNames = () => {
    return Object.keys(barangayLogos).filter(name => name !== 'default');
};