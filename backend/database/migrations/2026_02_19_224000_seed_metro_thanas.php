<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed metropolitan thanas (police station areas) for major cities.
 *
 * In city corporation areas, the upazila equivalent is the "thana".
 * Property owners in Dhaka/Chattogram identify locations by thana
 * (Dhanmondi, Gulshan, Mirpur, etc.), not by rural upazilas.
 *
 * Covers:
 *   - Dhaka DSCC (South): 18 thanas
 *   - Dhaka DNCC (North): 18 thanas
 *   - Chattogram City Corp: 12 thanas
 *   - Rajshahi City Corp: 4 thanas
 *   - Khulna City Corp: 3 thanas
 *   - Sylhet City Corp: 3 thanas
 *   - Gazipur City Corp: 5 thanas
 *   - Narayanganj City Corp: 3 thanas
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── Dhaka South City Corporation (DSCC) ──────────────────
        // District: Dhaka (id=47)
        DB::table('upazilas')->insertOrIgnore([
            ['id' => 501, 'district_id' => 47, 'name' => 'Dhanmondi',       'bn_name' => 'ধানমন্ডি'],
            ['id' => 502, 'district_id' => 47, 'name' => 'Lalbagh',         'bn_name' => 'লালবাগ'],
            ['id' => 503, 'district_id' => 47, 'name' => 'Kotwali',         'bn_name' => 'কোতোয়ালি'],
            ['id' => 504, 'district_id' => 47, 'name' => 'Sutrapur',        'bn_name' => 'সূত্রাপুর'],
            ['id' => 505, 'district_id' => 47, 'name' => 'Motijheel',       'bn_name' => 'মতিঝিল'],
            ['id' => 506, 'district_id' => 47, 'name' => 'Ramna',           'bn_name' => 'রমনা'],
            ['id' => 507, 'district_id' => 47, 'name' => 'Paltan',          'bn_name' => 'পল্টন'],
            ['id' => 508, 'district_id' => 47, 'name' => 'Wari',            'bn_name' => 'ওয়ারী'],
            ['id' => 509, 'district_id' => 47, 'name' => 'Bangshal',        'bn_name' => 'বংশাল'],
            ['id' => 510, 'district_id' => 47, 'name' => 'Chawkbazar',      'bn_name' => 'চকবাজার'],
            ['id' => 511, 'district_id' => 47, 'name' => 'Hazaribag',       'bn_name' => 'হাজারীবাগ'],
            ['id' => 512, 'district_id' => 47, 'name' => 'Kamrangirchar',   'bn_name' => 'কামরাঙ্গীরচর'],
            ['id' => 513, 'district_id' => 47, 'name' => 'Gendaria',        'bn_name' => 'গেন্ডারিয়া'],
            ['id' => 514, 'district_id' => 47, 'name' => 'Jatrabari',       'bn_name' => 'যাত্রাবাড়ী'],
            ['id' => 515, 'district_id' => 47, 'name' => 'Demra',           'bn_name' => 'ডেমরা'],
            ['id' => 516, 'district_id' => 47, 'name' => 'Kadamtali',       'bn_name' => 'কদমতলী'],
            ['id' => 517, 'district_id' => 47, 'name' => 'Shyampur',        'bn_name' => 'শ্যামপুর'],
            ['id' => 518, 'district_id' => 47, 'name' => 'Shahbag',         'bn_name' => 'শাহবাগ'],
        ]);

        // ── Dhaka North City Corporation (DNCC) ─────────────────
        DB::table('upazilas')->insertOrIgnore([
            ['id' => 521, 'district_id' => 47, 'name' => 'Uttara',          'bn_name' => 'উত্তরা'],
            ['id' => 522, 'district_id' => 47, 'name' => 'Mirpur',          'bn_name' => 'মিরপুর'],
            ['id' => 523, 'district_id' => 47, 'name' => 'Pallabi',         'bn_name' => 'পল্লবী'],
            ['id' => 524, 'district_id' => 47, 'name' => 'Kafrul',          'bn_name' => 'কাফরুল'],
            ['id' => 525, 'district_id' => 47, 'name' => 'Cantonment',      'bn_name' => 'ক্যান্টনমেন্ট'],
            ['id' => 526, 'district_id' => 47, 'name' => 'Banani',          'bn_name' => 'বনানী'],
            ['id' => 527, 'district_id' => 47, 'name' => 'Gulshan',         'bn_name' => 'গুলশান'],
            ['id' => 528, 'district_id' => 47, 'name' => 'Tejgaon',         'bn_name' => 'তেজগাঁও'],
            ['id' => 529, 'district_id' => 47, 'name' => 'Mohammadpur',     'bn_name' => 'মোহাম্মদপুর'],
            ['id' => 530, 'district_id' => 47, 'name' => 'Adabor',          'bn_name' => 'আদাবর'],
            ['id' => 531, 'district_id' => 47, 'name' => 'Badda',           'bn_name' => 'বাড্ডা'],
            ['id' => 532, 'district_id' => 47, 'name' => 'Khilkhet',        'bn_name' => 'খিলক্ষেত'],
            ['id' => 533, 'district_id' => 47, 'name' => 'Vatara',          'bn_name' => 'ভাটারা'],
            ['id' => 534, 'district_id' => 47, 'name' => 'Turag',           'bn_name' => 'তুরাগ'],
            ['id' => 535, 'district_id' => 47, 'name' => 'Dakshinkhan',     'bn_name' => 'দক্ষিণখান'],
            ['id' => 536, 'district_id' => 47, 'name' => 'Rupnagar',        'bn_name' => 'রূপনগর'],
            ['id' => 537, 'district_id' => 47, 'name' => 'Khilgaon',        'bn_name' => 'খিলগাঁও'],
            ['id' => 538, 'district_id' => 47, 'name' => 'Sabujbagh',       'bn_name' => 'সবুজবাগ'],
        ]);

        // ── Chattogram City Corporation ─────────────────────────
        // District: Chattogram (id=8)
        DB::table('upazilas')->insertOrIgnore([
            ['id' => 551, 'district_id' => 8, 'name' => 'Kotwali (CTG)',     'bn_name' => 'কোতোয়ালি'],
            ['id' => 552, 'district_id' => 8, 'name' => 'Panchlaish',       'bn_name' => 'পাঁচলাইশ'],
            ['id' => 553, 'district_id' => 8, 'name' => 'Double Mooring',   'bn_name' => 'ডবলমুরিং'],
            ['id' => 554, 'district_id' => 8, 'name' => 'Bakalia',          'bn_name' => 'বাকলিয়া'],
            ['id' => 555, 'district_id' => 8, 'name' => 'Chandgaon',        'bn_name' => 'চান্দগাঁও'],
            ['id' => 556, 'district_id' => 8, 'name' => 'Khulshi',          'bn_name' => 'খুলশী'],
            ['id' => 557, 'district_id' => 8, 'name' => 'Pahartali',        'bn_name' => 'পাহাড়তলী'],
            ['id' => 558, 'district_id' => 8, 'name' => 'Patenga',          'bn_name' => 'পতেঙ্গা'],
            ['id' => 559, 'district_id' => 8, 'name' => 'Bayazid',          'bn_name' => 'বায়েজিদ'],
            ['id' => 560, 'district_id' => 8, 'name' => 'EPZ',              'bn_name' => 'ইপিজেড'],
            ['id' => 561, 'district_id' => 8, 'name' => 'Akbar Shah',       'bn_name' => 'আকবর শাহ'],
            ['id' => 562, 'district_id' => 8, 'name' => 'Halishahar',       'bn_name' => 'হালিশহর'],
        ]);

        // ── Rajshahi City Corporation ────────────────────────────
        // District: Rajshahi (id=15)
        DB::table('upazilas')->insertOrIgnore([
            ['id' => 571, 'district_id' => 15, 'name' => 'Boalia',          'bn_name' => 'বোয়ালিয়া'],
            ['id' => 572, 'district_id' => 15, 'name' => 'Rajpara',         'bn_name' => 'রাজপাড়া'],
            ['id' => 573, 'district_id' => 15, 'name' => 'Matihar',         'bn_name' => 'মতিহার'],
            ['id' => 574, 'district_id' => 15, 'name' => 'Shah Makhdum',    'bn_name' => 'শাহ মখদুম'],
        ]);

        // ── Khulna City Corporation ──────────────────────────────
        // District: Khulna (id=27)
        DB::table('upazilas')->insertOrIgnore([
            ['id' => 581, 'district_id' => 27, 'name' => 'Khulna Sadar (City)',  'bn_name' => 'খুলনা সদর'],
            ['id' => 582, 'district_id' => 27, 'name' => 'Sonadanga',       'bn_name' => 'সোনাডাঙ্গা'],
            ['id' => 583, 'district_id' => 27, 'name' => 'Khalishpur',      'bn_name' => 'খালিশপুর'],
        ]);

        // ── Sylhet City Corporation ──────────────────────────────
        // District: Sylhet (id=36)
        DB::table('upazilas')->insertOrIgnore([
            ['id' => 591, 'district_id' => 36, 'name' => 'Kotwali (Sylhet)', 'bn_name' => 'কোতোয়ালি'],
            ['id' => 592, 'district_id' => 36, 'name' => 'South Surma',     'bn_name' => 'দক্ষিণ সুরমা'],
            ['id' => 593, 'district_id' => 36, 'name' => 'Airport (Sylhet)', 'bn_name' => 'বিমানবন্দর'],
        ]);

        // ── Gazipur City Corporation ─────────────────────────────
        // District: Gazipur (id=41)
        DB::table('upazilas')->insertOrIgnore([
            ['id' => 601, 'district_id' => 41, 'name' => 'Tongi',           'bn_name' => 'টঙ্গী'],
            ['id' => 602, 'district_id' => 41, 'name' => 'Basan',           'bn_name' => 'বাসন'],
            ['id' => 603, 'district_id' => 41, 'name' => 'Konabari',        'bn_name' => 'কোনাবাড়ি'],
            ['id' => 604, 'district_id' => 41, 'name' => 'Board Bazar',     'bn_name' => 'বোর্ড বাজার'],
            ['id' => 605, 'district_id' => 41, 'name' => 'Chandona',        'bn_name' => 'চান্দনা'],
        ]);

        // ── Narayanganj City Corporation ─────────────────────────
        // District: Narayanganj (id=43)
        DB::table('upazilas')->insertOrIgnore([
            ['id' => 611, 'district_id' => 43, 'name' => 'Fatullah',        'bn_name' => 'ফতুল্লা'],
            ['id' => 612, 'district_id' => 43, 'name' => 'Siddhirganj',     'bn_name' => 'সিদ্ধিরগঞ্জ'],
            ['id' => 613, 'district_id' => 43, 'name' => 'Narayanganj Kotwali', 'bn_name' => 'নারায়ণগঞ্জ কোতোয়ালি'],
        ]);
    }

    public function down(): void
    {
        DB::table('upazilas')->whereIn('id', range(501, 538))->delete();
        DB::table('upazilas')->whereIn('id', range(551, 562))->delete();
        DB::table('upazilas')->whereIn('id', range(571, 574))->delete();
        DB::table('upazilas')->whereIn('id', range(581, 583))->delete();
        DB::table('upazilas')->whereIn('id', range(591, 593))->delete();
        DB::table('upazilas')->whereIn('id', range(601, 605))->delete();
        DB::table('upazilas')->whereIn('id', range(611, 613))->delete();
    }
};
