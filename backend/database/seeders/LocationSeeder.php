<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDivisions();
        $this->seedDistricts();
        $this->seedUpazilas();
        $this->seedMouzas();
    }

    private function seedDivisions(): void
    {
        $divisions = [
            ['name' => 'Barishal', 'bn_name' => 'বরিশাল'],
            ['name' => 'Chattogram', 'bn_name' => 'চট্টগ্রাম'],
            ['name' => 'Dhaka', 'bn_name' => 'ঢাকা'],
            ['name' => 'Khulna', 'bn_name' => 'খুলনা'],
            ['name' => 'Mymensingh', 'bn_name' => 'ময়মনসিংহ'],
            ['name' => 'Rajshahi', 'bn_name' => 'রাজশাহী'],
            ['name' => 'Rangpur', 'bn_name' => 'রংপুর'],
            ['name' => 'Sylhet', 'bn_name' => 'সিলেট'],
        ];

        foreach ($divisions as $division) {
            DB::table('divisions')->updateOrInsert(
                ['name' => $division['name']],
                array_merge($division, ['country_code' => 'BGD'])
            );
        }
    }

    private function seedDistricts(): void
    {
        $districts = [
            // Barishal Division (6 districts)
            'Barishal' => ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],

            // Chattogram Division (11 districts)
            'Chattogram' => ['Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla', 'Cox\'s Bazar', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'],

            // Dhaka Division (13 districts)
            'Dhaka' => ['Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'],

            // Khulna Division (10 districts)
            'Khulna' => ['Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'],

            // Mymensingh Division (4 districts)
            'Mymensingh' => ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],

            // Rajshahi Division (8 districts)
            'Rajshahi' => ['Bogura', 'Chapainawabganj', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajganj'],

            // Rangpur Division (8 districts)
            'Rangpur' => ['Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon'],

            // Sylhet Division (4 districts)
            'Sylhet' => ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
        ];

        foreach ($districts as $divisionName => $districtNames) {
            $divisionId = DB::table('divisions')->where('name', $divisionName)->value('id');
            if (!$divisionId) continue;

            foreach ($districtNames as $districtName) {
                DB::table('districts')->updateOrInsert(
                    ['name' => $districtName, 'division_id' => $divisionId],
                    ['bn_name' => null] // Bengali names can be added later
                );
            }
        }
    }

    private function seedUpazilas(): void
    {
        // Representative upazilas for major districts
        // Full dataset can be loaded from JSON in production
        $upazilas = [
            // Dhaka District
            'Dhaka' => ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar', 'Tejgaon', 'Mirpur', 'Mohammadpur', 'Gulshan', 'Uttara'],

            // Chattogram District
            'Chattogram' => ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda'],

            // Gazipur District
            'Gazipur' => ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'],

            // Narayanganj District
            'Narayanganj' => ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon'],

            // Rangpur District
            'Rangpur' => ['Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Rangpur Sadar', 'Taraganj'],

            // Sylhet District
            'Sylhet' => ['Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Dakshin Surma', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmani Nagar', 'South Surma', 'Sylhet Sadar', 'Zakiganj'],

            // Rajshahi District
            'Rajshahi' => ['Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Rajshahi Sadar', 'Tanore'],

            // Khulna District
            'Khulna' => ['Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada', 'Khalishpur'],

            // Comilla District
            'Comilla' => ['Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Comilla Sadar', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Monoharganj', 'Meghna', 'Muradnagar', 'Nangalkot', 'Titas'],

            // Cox's Bazar District
            'Cox\'s Bazar' => ['Chakaria', 'Cox\'s Bazar Sadar', 'Kutubdia', 'Maheshkhali', 'Pekua', 'Ramu', 'Teknaf', 'Ukhia'],

            // Barishal District
            'Barishal' => ['Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Barishal Sadar', 'Gournadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'],

            // Mymensingh District
            'Mymensingh' => ['Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Mymensingh Sadar', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal'],

            // Bogura District
            'Bogura' => ['Adamdighi', 'Bogura Sadar', 'Dhunat', 'Dupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatola'],
        ];

        foreach ($upazilas as $districtName => $upazilaNames) {
            $districtId = DB::table('districts')->where('name', $districtName)->value('id');
            if (!$districtId) continue;

            foreach ($upazilaNames as $upazilaName) {
                DB::table('upazilas')->updateOrInsert(
                    ['name' => $upazilaName, 'district_id' => $districtId],
                    ['bn_name' => null]
                );
            }
        }
    }

    private function seedMouzas(): void
    {
        // Representative mouzas for common upazilas used in local testing.
        $mouzasByUpazila = [
            'Mirpur' => ['Pallabi', 'Kazipara', 'Shewrapara', 'Monipur', 'Rupnagar'],
            'Tejgaon' => ['Tejgaon Industrial Area', 'Nikunja', 'Karwan Bazar'],
            'Gulshan' => ['Gulshan', 'Banani', 'Badda'],
            'Uttara' => ['Uttara', 'Diabari', 'Dakshinkhan'],
            'Savar' => ['Hemayetpur', 'Amin Bazar', 'Ashulia'],
            'Keraniganj' => ['Zinzira', 'Kalatia', 'Rohitpur'],
            'Dhamrai' => ['Dhamrai', 'Kulla', 'Sutipara'],
            'Gazipur Sadar' => ['Joydebpur', 'Pubail', 'Kashimpur'],
            'Narayanganj Sadar' => ['Fatullah', 'Siddhirganj', 'Kutubpur'],
            'Rajshahi Sadar' => ['Boalia', 'Shah Makhdum', 'Katakhali'],
            'Sylhet Sadar' => ['Jalalabad', 'Tukerbazar', 'Khadimnagar'],
            'Khulna' => ['Khalishpur', 'Daulatpur', 'Sonadanga'],
            'Comilla Sadar' => ['Kotwali', 'Kandirpar', 'Chandpur'],
            'Cox\'s Bazar Sadar' => ['Jhilongja', 'Khurushkul', 'Pokkhali'],
            'Barishal Sadar' => ['Kawnia', 'Rupatali', 'Chandmari'],
            'Mymensingh Sadar' => ['Char Ishwardia', 'Shambhuganj', 'Maskanda'],
            'Bogura Sadar' => ['Matidali', 'Nishindara', 'Erulia'],
        ];

        foreach ($mouzasByUpazila as $upazilaName => $mouzaNames) {
            $upazilaId = DB::table('upazilas')->where('name', $upazilaName)->value('id');
            if (!$upazilaId) {
                continue;
            }

            foreach ($mouzaNames as $index => $mouzaName) {
                DB::table('mouzas')->updateOrInsert(
                    ['upazila_id' => $upazilaId, 'name' => $mouzaName],
                    [
                        'bn_name' => null,
                        'jl_number' => (string) ($index + 1),
                    ]
                );
            }
        }
    }
}
