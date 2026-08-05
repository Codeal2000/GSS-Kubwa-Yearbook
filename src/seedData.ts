import { db } from './firebase';
import { writeBatch, doc } from 'firebase/firestore';

export interface StudentVotes {
  tech_guru?: number;
  most_creative?: number;
  class_scholar?: number;
  most_famous?: number;
  best_smile?: number;
  next_ceo?: number;
  style_icon?: number;
  class_comedian?: number;
  sports_mvp?: number;
  quiet_achiever?: number;
  world_traveler?: number;
  unsung_hero?: number;
  [key: string]: number | undefined;
}

export interface Student {
  id: string;
  fullName: string;
  examNumber: string;
  photoFilename: string;
  birthDate: string;
  votes: StudentVotes;
  quote: string;
  hobbies?: string;
  careerPath?: string;
  email?: string;
  phone?: string;
  featuredOnHome?: boolean;
  createdAt?: any;
}

export const rawCSV = `FullName,ExamNumber,PhotoFilename,BirthDate
Abass Khalid Ololade,4020204001,1.jpg,20 March
Abayomi Kehinde Glory,4020204002,2.jpg,30 March
Abayomi Taye Precious,4020204003,3.jpg,30 March
Abdulazeez Abdulateef,4020204004,4.jpg,31 May
Abdulazeez Jemila Omayoza,4020204005,5.jpg,25 February
Abdulazeez Umeima Oyiza,4020204006,6.jpg,19 May
Abdulganiyu Aeesha Oyereyi,4020204007,7.jpg,27 July
Abdulhakeem Abdulbaqee Olayinka,4020204008,8.jpg,11 April
Abdulhakeem Mustapha Adetunji,4020204009,9.jpg,11 June
Abduljaleel Mujeebah Olabisi,4020204010,10.jpg,27 April
Abdulkarim Shafa'atu,4020204011,11.jpg,25 April
Abdullahi Aisha,4020204012,12.jpg,10 October
Abdullahi Ibrahim,4020204013,13.jpg,15 July
Abdullahi Labib,4020204014,14.jpg,17 July
Abdullahi Mariyam,4020204015,15.jpg,18 July
Abdullahi Muhammad Abubakar,4020204016,16.jpg,5 October
Abdullahi Muhammad Kabir,4020204017,17.jpg,25 July
Abdullahi Nafisa,4020204018,18.jpg,15 August
Abdulmajeed-Ibrahim Raheema,4020204019,19.jpg,6 October
Abdulrahman Ashraf Ahmed,4020204020,20.jpg,12 April
Abdulrahman Tha'abit Onimisi,4020204021,21.jpg,29 June
Abdulrasaq Hamidat,4020204022,22.jpg,12 September
Abdulra'uf Muhizah,4020204023,23.jpg,23 June
Abdulssalam Buhari Muhammad Bukhary,4020204024,24.jpg,30 March
Abdulwakeel Mahfuz Olamilekan,4020204025,25.jpg,5 January
Abdulwasiu Rabiah,4020204026,26.jpg,1 August
Abel Iruoghene Unique,4020204027,27.jpg,11 July
Abidemi Ainaodunayo Christabel,4020204028,28.jpg,18 November
Abiodun Oladimeji Joshua,4020204029,29.jpg,26 March
Abonyi Esther Onyinyechi,4020204030,30.jpg,12 April
Abraham Favour Ugbede,4020204031,31.jpg,4 October
Abraham Princess Alice,4020204032,32.jpg,12 March
Abu Olamiposi Joseph,4020204033,33.jpg,7 March
Abubakar Jibril Danjuma,4020204034,34.jpg,22 April
Abutu Marvellous,4020204035,35.jpg,19 August
Adam Khadijah Idris,4020204036,36.jpg,24 April
Adams Favour,4020204037,37.jpg,21 July
Adebanjo Daniel Anuoluwapo,4020204038,38.jpg,4 September
Adebayo Dominion Ayomiposi,4020204039,39.jpg,26 May
Adebayo Rejoice Oluwanifemi,4020204040,40.jpg,13 March
Adeboyejo Stephen Inioluwa,4020204041,41.jpg,26 December
Adefemi Olamide Stephen,4020204042,42.jpg,11 October
Adegahi Favour,4020204043,43.jpg,10 December
Adelodun Bashirat,4020204044,44.jpg,2 March
Adenekan Abdulbasit Oluwaferanmi,4020204045,45.jpg,19 July
Adewale Olamide Elizabeth,4020204046,46.jpg,21 October
Adeyemi Timileyin Hammed,4020204047,47.jpg,25 February
Adeyemi Victoria,4020204048,48.jpg,24 June
Adeyemo Adedire Adebola,4020204049,49.jpg,3 August
Adizua Edna Chisom,4020204050,50.jpg,2 April
Afolabi Bukunmi Ebenezer,4020204051,51.jpg,13 January
Afolayan Moses Seun,4020204052,52.jpg,31 October
Agbim Chigozie Theresa,4020204053,53.jpg,22 January
Agbo Blessing Chisom,4020204054,54.jpg,19 August
Agbo Chinekwu Mabel,4020204055,55.jpg,5 August
Agbo Emmanuella Ekondu,4020204056,56.jpg,3 July
Agbor Peace Beatrice,4020204057,57.jpg,23 June
Agum Isaac Tersen,4020204058,58.jpg,18 September
Aguzuo Glory Chiamaka,4020204059,59.jpg,17 September
Ahize Favour Chidubem,4020204060,60.jpg,13 October
Ahmad Fatima Danfulani,4020204061,61.jpg,1 December
Ahmad Hanifa,4020204062,62.jpg,9 May
Ahmed Hauwa Gumel,4020204063,63.jpg,1 December
Ahmed Khadijah Emike,4020204064,64.jpg,10 September
Ahmed Zainab Gumel,4020204065,65.jpg,20 June
Ahukanna Favour Chinasa,4020204066,66.jpg,30 March
Aina Teniola Eunice,4020204067,67.jpg,20 May
Aitanun Angel Omono,4020204068,68.jpg,24 September
Aitanun Mercy Onyekachi,4020204069,69.jpg,13 August
Aiyedogbon Oluwasemilore Onaopemiposi,4020204070,70.jpg,29 October
Ajagor Royal Kosisochukwu,4020204071,71.jpg,18 April
Ajah Chimere Marvellous,4020204072,72.jpg,8 July
Ajalogun Azeezat Omotola,4020204073,73.jpg,17 June
Ajibola Favour Goodness,4020204074,74.jpg,24 March
Akala Wisdom Kamsiyochukwu,4020204075,75.jpg,11 May
Akamitang David Unimk,4020204076,76.jpg,27 September
Akan Miracle Emem,4020204077,77.jpg,26 May
Akanama Ama,4020204078,78.jpg,14 October
Akande Deborah Omolola,4020204079,79.jpg,19 September
Akaneme Emmanuel Chukwunwike,4020204080,80.jpg,1 December
Akarahu Winner Chimeremueze,4020204081,81.jpg,20 April
Akinbobola Oluwatobiloba Isioma,4020204082,82.jpg,1 October
Akindonyin Ayomide Victor,4020204083,83.jpg,23 November
Akinfenwa Dolapo Janet,4020204084,84.jpg,14 April
Akinola Ayomikun Eunice,4020204085,85.jpg,11 January
Akintomide Bright Okikijesu,4020204086,86.jpg,15 March
Akinyemi Rejoice Gold,4020204087,87.jpg,25 March
Akinyosoye Ifedayo Samuel,4020204088,88.jpg,2 November
Akowe Jesse,4020204089,89.jpg,20 December
Akpan Abigail Onyinyechi,4020204090,90.jpg,10 July
Akula Nater King,4020204091,91.jpg,27 October
Akumba Angel Chinenye,4020204092,92.jpg,14 May
Alaaye Isreal,4020204093,93.jpg,18 July
Alabi Abdurroheem Ayodele,4020204094,94.jpg,8 April
Alabi David Onimisi,4020204095,95.jpg,24 September
Alabi Rebecca Ajibola,4020204096,96.jpg,7 March
Alade Toib,4020204097,97.jpg,8 June
Alao Mukhtar Adeniyi,4020204098,98.jpg,16 October
Alaribe Adaeze Precious,4020204099,99.jpg,14 December
Albert Anna Ojonele,4020204100,100.jpg,26 April
Albert Ethan Edu,4020204101,101.jpg,26 April
Alexander Uzoma,4020204102,102.jpg,30 June
Ali Sheriffdeen,4020204103,103.jpg,17 June
Aliyu Abdulrahman Doga,4020204104,104.jpg,28 September
Aliyu Yasmin Muhammad,4020204105,105.jpg,30 October
Amadu Peculiar,4020204106,106.jpg,20 December
Aminu Fatima,4020204107,107.jpg,10 October
Aminu Firdausi Oyiza,4020204108,108.jpg,8 December
Aminu Hauwau,4020204109,109.jpg,15 September
Aminu Joy Ojochegbe,4020204110,110.jpg,9 November
Aminu Masuda,4020204111,111.jpg,25 June
Amodu Mercy Ejimomi,4020204112,112.jpg,6 June
Amos Anabel Pemosi,4020204113,113.jpg,6 June
Anaele Onyedikachi Goodness,4020204114,114.jpg,4 May
Anene Alexander Chukwuebuka,4020204115,115.jpg,18 January
Ani Henry Eni,4020204116,116.jpg,19 October
Anibe Grace Ibe,4020204117,117.jpg,28 August
Anietie-Dan Lydia Mfoniso,4020204118,118.jpg,19 April
Anoribe Precious Ugochi,4020204119,119.jpg,30 December
Anthony Favour Chukwu,4020204120,120.jpg,5 November
Anyaora Victory Chiemerie,4020204121,121.jpg,4 August
Anyigor Cynthia Ifunanya,4020204122,122.jpg,29 October
Anyonya Divine Efemena,4020204123,123.jpg,3 May
Arastus Pwashikai,4020204124,124.jpg,8 May
Aregbesola Kifayatullah Gbemisola,4020204125,125.jpg,18 July
Arome Ojochide Deborah,4020204126,126.jpg,23 March
Asadu Ezinne Faith,4020204127,127.jpg,17 October
Asamu Al-Ameen Abolaji,4020204128,128.jpg,18 May
Asekomhe Charity Avuedoya,4020204129,129.jpg,26 February
Asogwa Favour Nnodebe,4020204130,130.jpg,4 April
Attah Jesse Ugbede,4020204131,131.jpg,8 January
Audu Christiana Ojoagefu,4020204132,132.jpg,22 December
Augustine Clementina Omojo,4020204133,133.jpg,19 June
Augustine Treasure Nmesomachukwu,4020204134,134.jpg,12 July
Awoniyi Precious Eniola,4020204135,135.jpg,19 January
Ayaun Msaan Joy,4020204136,136.jpg,4 February
Ayinde Abdulsamad,4020204137,137.jpg,5 April
Ayinmode Blessing Funmilayo,4020204138,138.jpg,31 December
Ayodele Oluwafisayo Joseph,4020204139,139.jpg,17 April
Ayodele Oluwaseun Victoria,4020204140,140.jpg,12 October
Ayoola Oyindamola Precious,4020204141,141.jpg,12 July
Baba Angela,4020204142,142.jpg,2 July
Babatunde Omofolahan Emmanuel,4020204143,143.jpg,17 April
Babawale Mary Adebukola,4020204144,144.jpg,20 March
Baitachi Charity,4020204145,145.jpg,25 April
Bakenna Ayuba Olamilekan,4020204146,146.jpg,5 August
Bako Happiness Arwashi,4020204147,147.jpg,27 April
Bamisile Blessing Temitope,4020204148,148.jpg,25 January
Bariakpoa Ernest Legbosi,4020204149,149.jpg,10 March
Bari-Nyana Andre Kwesi,4020204150,150.jpg,12 September
Bashir Abdulsobur,4020204151,151.jpg,20 April
Bashir Asiya Shagari,4020204152,152.jpg,30 January
Basil Favour Ngozi,4020204153,153.jpg,19 September
Bello Mustapha Tata,4020204154,154.jpg,5 April
Bello Nafisat Ayinke,4020204155,155.jpg,13 November
Bello Thara Ize,4020204156,156.jpg,11 July
Bello Zafira Ozozahuwa,4020204157,157.jpg,11 July
Benjamin Osemudiamhen,4020204158,158.jpg,17 April
Benneth Tochukwu David,4020204159,159.jpg,11 November
Ben-Ukanwoke Onyinyechi Chimdindu,4020204160,160.jpg,9 April
Berebon David Chiemere,4020204161,161.jpg,18 September
Biko Mary,4020204162,162.jpg,22 February
Bishop Rejoice Adaobi,4020204163,163.jpg,29 July
Bishop Rihanna Kamsi,4020204164,164.jpg,29 July
Bitrus Amirgumninah Angela,4020204165,165.jpg,28 June
Bitrus Treasure Kyangchat,4020204166,166.jpg,24 May
Bolaji Boluwatife Daniel,4020204167,167.jpg,3 December
Cassidy Destiny Himnom,4020204168,168.jpg,23 November
Chiaka Glorious Ozioma,4020204169,169.jpg,10 February
Chibiko Testimony Oluoma,4020204170,170.jpg,30 October
Chibuogwu Racheal Nmesoma,4020204171,171.jpg,4 December
Chibuzo Marvelous Chimeremeze,4020204172,172.jpg,21 May
Chibuzor Great Chidiebube,4020204173,173.jpg,3 November
Chibuzor Miracle Chidiebere,4020204174,174.jpg,3 November
Chidi Majesty Chinaecherim,4020204175,175.jpg,2 April
Chidi Rejoice Chinememma,4020204176,176.jpg,5 December
Chidiadi Collins Chinonso,4020204177,177.jpg,4 June
Chikaodiri Chinenye Peace,4020204178,178.jpg,30 June
Chima Amanda Nwadinma,4020204179,179.jpg,13 June
Chime Goodluck David,4020204180,180.jpg,21 April
Chinabu Chinemerem Clinton,4020204181,181.jpg,4 May
Chinanuife Ruth Chioma,4020204182,182.jpg,31 October
Chinedu Chinedu Christian,4020204183,183.jpg,12 May
Chinedu Chisom Chinagorom,4020204184,184.jpg,22 September
Chinedu Destiny Akachukwu,4020204185,185.jpg,4 April
Chinedu Marvelous Chinaza,4020204186,186.jpg,16 June
Chinonso Chidera Benedicta,4020204187,187.jpg,22 June
Chirah Chioma Precious,4020204188,188.jpg,25 February
Chollom Ruth Dalyop,4020204189,189.jpg,17 March
Chukwu Emmanuel Chidindu,4020204190,190.jpg,17 July
Chukwu Emmanuella Chinwendu,4020204191,191.jpg,17 July
Chukwu Victoria Daberechi,4020204192,192.jpg,26 August
Chukwuani Dominic Chinomso,4020204193,193.jpg,30 June
Chukwubueze Chukwuemeka Innocent,4020204194,194.jpg,3 May
Chukwudi David Ekpereka,4020204195,195.jpg,25 May
Chukwuemeka Gift Uchenna,4020204196,196.jpg,3 November
Chukwuemeke Samuel,4020204197,197.jpg,23 July
Chukwuezi Daniel Ebuka,4020204198,198.jpg,30 September
Chukwuikpe Chinecherem Emmanuella,4020204199,199.jpg,11 March
Chukwuneke Divine Ogechukwu,4020204200,200.jpg,15 March
Chukwuneme Precious Amarachi,4020204201,201.jpg,25 June
Clement Chiziterem Glory,4020204202,202.jpg,20 April
Clement Goodness Tosin,4020204203,203.jpg,11 May
Dagunduru Faith Ayomide,4020204204,204.jpg,2 September
Damian Faith Chinaza,4020204205,205.jpg,23 October
Daniel Catherine Ochuole,4020204206,206.jpg,25 May
Daniel Grant,4020204207,207.jpg,16 December
Daniel Miracle Otse,4020204208,208.jpg,7 September
Daniel Peace Tishino,4020204209,209.jpg,5 February
Daniel Salome,4020204210,210.jpg,14 October
Danladi Endurance Musa,4020204211,211.jpg,24 October
David Meshack Ayemele,4020204212,212.jpg,25 August
Dawang Lovelyn Diedoem,4020204213,213.jpg,28 September
Dennis Blessed Aniefiok,4020204214,214.jpg,21 April
Dibuah Isaac Sochukwuezue,4020204215,215.jpg,30 June
Duru Chinaza Emmanuella,4020204216,216.jpg,14 December
Duru-Mbachu Pamela Ugochi,4020204217,217.jpg,2 January
Ebirim Amarachukwu Daniella,4020204218,218.jpg,17 June
Ebirim Onyinyeoma Emmanuella,4020204219,219.jpg,28 June
Edegbo Happiness Olubojo,4020204220,220.jpg,19 September
Edibo Famous Ojotule,4020204221,221.jpg,22 December
Edward Okibeh,4020204222,222.jpg,27 September
Efada Joseph Oineh,4020204223,223.jpg,9 November
Effiong Deborah Alfred,4020204224,224.jpg,4 June
Eguma Christopher Iyi-Owo,4020204225,225.jpg,19 May
Ehiguese Junior Ebhose,4020204226,226.jpg,20 January
Ehinmidu Damilola,4020204227,227.jpg,31 January
Ehizojie Elizabeth Ono,4020204228,228.jpg,6 November
Ejeh Perpetual Peace,4020204229,229.jpg,29 March
Ejiogu Luke Munachimso,4020204230,230.jpg,4 December
Ekeh Amarachi Stephanie,4020204231,231.jpg,2 November
Ekeh Mallachy Chibuike,4020204232,232.jpg,1 May
Ekesiani Gift Chinecherem,4020204233,233.jpg,18 November
Ekeson Prince Akachukwu,4020204234,234.jpg,2 April
Ekwok Blessing,4020204235,235.jpg,31 July
Ekwugwum Ogochukwu Mercy,4020204236,236.jpg,27 July
Elebachi-Uboh Michelle Uchechukwu,4020204237,237.jpg,23 July
Eleke Deborah Oluebube,4020204238,238.jpg,4 June
Elijah Niya,4020204239,239.jpg,8 December
Elisha David Emeka,4020204240,240.jpg,30 October
Emeka Christabel Chioma,4020204241,241.jpg,10 November
Emeka Promise Ejiofor,4020204242,242.jpg,19 July
Emele Esther Onyinyechi,4020204243,243.jpg,9 March
Emelife Emmanuella Chidinma,4020204244,244.jpg,10 December
Emem Ekemini,4020204245,245.jpg,15 July
Emenike Rejioce Ozioma,4020204246,246.jpg,20 May
Emmanuel Caleb Ikechukwu,4020204247,247.jpg,5 February
Emmanuel Daniel Chimaobim,4020204248,248.jpg,5 August
Emmanuel David Chijindu,4020204249,249.jpg,4 May
Emmanuel Mercy Eseroghene,4020204250,250.jpg,29 June
Emmanuel Monica Ogbene,4020204251,251.jpg,20 January
Enawore David,4020204252,252.jpg,2 June
Ende-Nathaniel Joan Tessa,4020204253,253.jpg,9 September
Enikanoselu Daniel Bola,4020204254,254.jpg,20 October
Enokela Godwin Ukwenya,4020204255,255.jpg,15 February
Enwelu Nmachukwu Divine,4020204256,256.jpg,21 July
Erameh Jennifer,4020204257,257.jpg,27 July
Erhuvwu Fejiro David,4020204258,258.jpg,20 July
Erondu Destiny Chinaza,4020204259,259.jpg,24 February
Esumobi Grace Ifelunwa,4020204260,260.jpg,7 October
Etoamaihe Mmesoma Marvelous,4020204261,261.jpg,16 September
Etuk Mfoniso Miriam,4020204262,262.jpg,11 January
Eze Favour Chisom,4020204263,263.jpg,23 August
Eze Greatness Ihuoma,4020204264,264.jpg,30 June
Eze Nmesoma Divine,4020204265,265.jpg,2 February
Eze Peace,4020204266,266.jpg,10 March
Eze Ujunwa Esther,4020204267,267.jpg,11 October
Ezeagu Miracle Chinazaekpere,4020204268,268.jpg,11 October
Ezekiel Ekemini Monday,4020204269,269.jpg,6 May
Ezekiel Noble,4020204270,270.jpg,9 May
Ezema Favour Ebube,4020204271,271.jpg,1 December
Ezemma Harrison Chinecherem,4020204272,272.jpg,19 November
Ezenwadi Chimaijem Cosmas,4020204273,273.jpg,26 July
Ezeorizu Amarachukwu Vivian,4020204274,274.jpg,15 January
Ezere Emmanuella Chinyereuba,4020204275,275.jpg,17 December
Ezigbo Chisom Jennifer,4020204276,276.jpg,25 July
Ezugwu Micheal Okechikwukere,4020204277,277.jpg,27 July
Fagebo Esther Ifeoluwa,4020204278,278.jpg,22 April
Fashe Abdulbasit,4020204279,279.jpg,20 May
Femi David Ekhoia,4020204280,280.jpg,25 October
Festus Dominion,4020204281,281.jpg,16 September
Fidelis Clementina Annamay,4020204282,282.jpg,17 December
Fidelis Esther Sopuruchukwu,4020204283,283.jpg,1 May
Frank Iruoghene,4020204284,284.jpg,27 January
Frank Kamsiyochukwu Esther,4020204285,285.jpg,20 March
Funso Olamide Mercy,4020204286,286.jpg,6 October
Gabriel Ifeoluwaposimi Moses,4020204287,287.jpg,17 November
Gabriel Nanret Enoch,4020204288,288.jpg,4 September
Gabriel Ojochogwu Joab,4020204289,289.jpg,17 August
George Anthonia Emike,4020204290,290.jpg,1 February
Godson Light Chidiebere,4020204291,291.jpg,8 March
Godson Precious Oluwadamilola,4020204292,292.jpg,18 August
Godspower Monica Rejoice,4020204293,293.jpg,2 February
Godwin Avadoo Grace,4020204294,294.jpg,26 August
Gold Damilola Prevailer,4020204295,295.jpg,25 February
Gontur Hope Sarah,4020204296,296.jpg,14 February
Habila Alheri Grace,4020204297,297.jpg,31 March
Hamza Maryam Lawal,4020204298,298.jpg,13 November
Haruna Alhassan,4020204299,299.jpg,14 November
Haruna Glory,4020204300,300.jpg,22 August
Haruna Nusaibat,4020204301,301.jpg,19 October
Hassan Mary,4020204302,302.jpg,1 September
Hassan Muhsinah Adeola,4020204303,303.jpg,30 April
Hassan Yusuf Al-Amin,4020204304,304.jpg,20 May
Hussain Asma'u Shazin,4020204305,305.jpg,27 July
Hussaini Abdullahi Abdullahi,4020204306,306.jpg,12 July
Ibe Chioma Favour,4020204307,307.jpg,19 January
Ibeawuchi Daniella Chimuanya,4020204308,308.jpg,15 September
Ibeawuchi Precious Chidinma,4020204309,309.jpg,15 March
Ibrahim Aisha Bukar,4020204310,310.jpg,22 December
Ibrahim Favour Rahanat,4020204311,311.jpg,4 January
Ibrahim Hashim Bena,4020204312,312.jpg,1 October
Ibrahim Kamaldeen Oluwaseun,4020204313,313.jpg,16 April
Ibrahim Khalid,4020204314,314.jpg,23 February
Ibrahim Muhammad Maahi,4020204315,315.jpg,12 December
Ibrahim Nabiha Ene,4020204316,316.jpg,27 May
Ibrahim Olamilekan Abdulganiu,4020204317,317.jpg,5 December
Idoko Derrick Somtochukwu,4020204318,318.jpg,20 April
Idris Ibrahim Noma,4020204319,319.jpg,7 May
Idris Zainab Ize,4020204320,320.jpg,13 March
Idris-Ismail Muadh Oladipupo,4020204321,321.jpg,7 February
Ifeanyi Emmanuel Oghenefegiro,4020204322,322.jpg,29 June
Ifeanyi Kosisochukwu,4020204323,323.jpg,6 May
Ifeanyichukwu Daniel Kamsiyonna,4020204324,324.jpg,30 August
Ifebuuche Emmanuel Dominion,4020204325,325.jpg,25 February
Igbo Fidelis Uzochi,4020204326,326.jpg,25 June
Igbokwe Ikechukwu Emmanuel,4020204327,327.jpg,9 January
Ige Diekololaoluwa Dominion,4020204328,328.jpg,17 March
Igiri Abigail,4020204329,329.jpg,18 August
Igomu Elizabeth Egahjonyah,4020204330,330.jpg,7 October
Igube Daberechi Rita,4020204331,331.jpg,30 December
Igwe Bright Uchechi,4020204332,332.jpg,1 February
Igwe Rejoice Ukamaka,4020204333,333.jpg,3 March
Iheakanwa Jesse Osinachi,4020204334,334.jpg,20 June
Ihezue Chidera Michelle Antoinette,4020204335,335.jpg,22 June
Ikechi Chihurumnaya Wisdom,4020204336,336.jpg,27 August
Ikechukwu Divine Anne,4020204337,337.jpg,8 June
Ikenna Favour Adaeze,4020204338,338.jpg,23 August
Ikpeni Emuobosa Gift,4020204339,339.jpg,15 October
Ikwue Oche David,4020204340,340.jpg,25 October
Iloh Michael Chukwunonso,4020204341,341.jpg,19 April
Ilorah Chigozie Michael,4020204342,342.jpg,11 May
Imafidon Prosper Pius,4020204343,343.jpg,6 February
Innocent Blessing Udo,4020204344,344.jpg,27 December
Ipigbhe Miracle Chinenye,4020204345,345.jpg,29 May
Isa Isa Abdulwasiu,4020204346,346.jpg,23 August
Isah Hauwa Jessica,4020204347,347.jpg,5 February
Isah Khamarudeen Omeiza,4020204348,348.jpg,11 April
Isah Lydia Omojo,4020204349,349.jpg,27 March
Isah Maryam Kusherki,4020204350,350.jpg,4 September
Isah Nazif,4020204351,351.jpg,20 August
Isah Ummusalma Kusherki,4020204352,352.jpg,8 December
Ishaq Fatima,4020204353,353.jpg,7 March
Ishola Hafeezoh Omolola,4020204354,354.jpg,21 April
Isiaka Mariiam Ayomide,4020204355,355.jpg,18 April
Isibor Jeremiah Esiomolomoh,4020204356,356.jpg,15 January
Ismail Hannatu Omolola,4020204357,357.jpg,4 April
Ismail Solihat Aderemi,4020204358,358.jpg,7 January
Ismaila Aliyu,4020204359,359.jpg,20 September
Israel Chiemerie Joan,4020204360,360.jpg,22 October
Isreal Miracle Nyong,4020204361,361.jpg,10 June
Iwomi Somtose Benedict,4020204362,362.jpg,9 June
Iwu Eucharia Onyekachi,4020204363,363.jpg,9 October
Iyama Bright Chimagbawe,4020204364,364.jpg,6 May
Iyen Flourish Eloghosa,4020204365,365.jpg,2 September
Iyke Kenneth Chukwuka,4020204366,366.jpg,16 March
Izonfade Luckyere Mabel,4020204367,367.jpg,7 October
Jacob Amos Olayinka,4020204368,368.jpg,27 February
James Blessing Miracle,4020204369,369.jpg,16 January
James Miracle Ogirima,4020204370,370.jpg,10 August
Jayeola Jomiloju Abigail,4020204371,371.jpg,12 June
Jerome David Ojone,4020204372,372.jpg,21 February
Jimoh Odunayo Ayomide,4020204373,373.jpg,6 December
John Chidinma Mary,4020204374,374.jpg,27 March
John Chinyere Helen,4020204375,375.jpg,17 September
John Comfort Apeh,4020204376,376.jpg,2 June
John David,4020204377,377.jpg,12 September
John Goodnews Oyiza,4020204378,378.jpg,3 October
John Perfect Orifan,4020204379,379.jpg,14 May
Joseph Deborah Ugochukwu,4020204380,380.jpg,1 January
Joshua Favour Erovre,4020204381,381.jpg,25 April
Josiah Zipporah Salasi,4020204382,382.jpg,20 May
Kabir Abdullahi Azzam,4020204383,383.jpg,21 October
Kadiri Deborah Moyinoluwa,4020204384,384.jpg,6 October
Kalu Chidinma,4020204385,385.jpg,23 March
Kayode Ayomide Henry,4020204386,386.jpg,20 January
Kelechi Joseph Wisdom,4020204387,387.jpg,28 May
Kelechukwu Nancy Chiamaka,4020204388,388.jpg,2 October
Kenneth Ifeoluwa Daniel,4020204389,389.jpg,18 July
Kenneth Queen Onyinyechukwu,4020204390,390.jpg,10 January
Kenneth Victory Chibuike,4020204391,391.jpg,15 January
Kolawole Success Temiloluwa,4020204392,392.jpg,29 August
Kyana Basil Ahamed,4020204393,393.jpg,28 March
Laoke Folasade Christiana,4020204394,394.jpg,19 October
Lawal Hauwa'u Amama,4020204395,395.jpg,19 August
Lawal Raihan Yakubu,4020204396,396.jpg,20 December
Lawal Sofia Ifeoluwa,4020204397,397.jpg,3 August
Lawrence Destiny Ogebe,4020204398,398.jpg,14 August
Lawrence Vivian Ojochenemi,4020204399,399.jpg,31 December
Liberty Khadijah,4020204400,400.jpg,8 October
Linus Cherish Ezinwa,4020204401,401.jpg,7 May
Lucky Favour,4020204402,402.jpg,14 January
Lucky Gift Chidimma,4020204403,403.jpg,8 May
Lukman Opeyemi Nominat,4020204404,404.jpg,28 March
Macanthony Sonma Sheila,4020204405,405.jpg,8 November
Madagwa Oghene Kparobor Famous,4020204406,406.jpg,20 February
Madumere Angel Chiamaka,4020204407,407.jpg,8 June
Mahmud Raheemah Jafaru,4020204408,408.jpg,10 November
Malachi Victor Solumtochukwu,4020204409,409.jpg,27 November
Malachy John Oluebube,4020204410,410.jpg,5 October
Malacky King Nsikabasi,4020204411,411.jpg,22 February
Mathew Chigozie Favour,4020204412,412.jpg,28 August
Mathias Josiah Joseph,4020204413,413.jpg,20 February
Matthew Anna,4020204414,414.jpg,5 July
Matthew Gloria Ojochegbe,4020204415,415.jpg,6 June
Matthew Happiness Ayinda,4020204416,416.jpg,1 January
Mbamara Amarachukwu Callista,4020204417,417.jpg,18 July
Mbelobi Praise Kelechi,4020204418,418.jpg,1 November
Memoye Isephemugh Daniella,4020204419,419.jpg,30 December
Mene Franca Mabamije,4020204420,420.jpg,22 June
Menkiti Ebube Cynthia,4020204421,421.jpg,23 January
Mgbodile Jennifer Makuochukwu,4020204422,422.jpg,28 November
Micah Triumph Shanyet Eshiomughamhe,4020204423,423.jpg,11 May
Michael Mary Godiya,4020204424,424.jpg,12 June
Micheal Favour Ubong,4020204425,425.jpg,30 January
Mmuoneke Patrick Chibuike,4020204426,426.jpg,20 October
Mohammed Ladidi Aisha,4020204427,427.jpg,21 March
Mohammed Ruth Kudirat,4020204428,428.jpg,25 December
Mojeed Hairat Tolani,4020204429,429.jpg,18 May
Monday Prosper Divine,4020204430,430.jpg,23 March
Moses Etombi Victoria Seun,4020204431,431.jpg,24 October
Mudi Blessing,4020204432,432.jpg,31 July
Muhammad Abdullahi,4020204433,433.jpg,22 December
Muhammad Abdulmalik Sadiq,4020204434,434.jpg,2 August
Muhammad Abdulmumin Bawada,4020204435,435.jpg,5 March
Muhammad Abubakar Badaru,4020204436,436.jpg,7 March
Muhammad Alamin Muhammad,4020204437,437.jpg,23 September
Muhammad Awwal Musa,4020204438,438.jpg,1 January
Muhammad Jamiu Ibrahim,4020204439,439.jpg,20 April
Muhammad Nasiru,4020204440,444.jpg,26 November
Muhammadulhadi Abdulsalam Yara,4020204441,444.jpg,30 April
Muhammed Aisha,4020204442,442.jpg,2 November
Muhammed Fatima Zara,4020204443,443.jpg,28 October
Muhammed Mubina,4020204444,444.jpg,5 July
Muhammed Rukayat,4020204445,445.jpg,3 June
Muritala Hajarat Idowu,4020204446,446.jpg,8 September
Musa Fulerah Ummee,4020204447,447.jpg,3 March
Musa Goodluck Abraham,4020204448,448.jpg,5 July
Musa Habiba,4020204449,449.jpg,26 February
Musa Mitchele Etsonsire,4020204450,450.jpg,26 August
Mustapha Hauwa Arafah,4020204451,451.jpg,21 November
Mustapha Muhammad Abdulsalam,4020204452,452.jpg,9 June
Mustapha Muhammad Al-Ameen Usman,4020204453,453.jpg,3 July
Mustapha Nafisat Olawumi,4020204454,454.jpg,14 April
Nasiru Faiza Onize,4020204455,455.jpg,27 September
Nathaniel Amarachi Marvellous,4020204456,456.jpg,24 February
Ndochukwu Chinenye Esther,4020204457,457.jpg,11 April
Ndubueze Emmanuel Akachukwu,4020204458,458.jpg,28 July
Ndubuisi Chikamso Joy,4020204459,459.jpg,2 November
Ndubuisi Victor Chisom,4020204460,460.jpg,5 March
Ndukwu Assumpta Gifechukwu,4020204461,461.jpg,20 June
Ngbede Samuel Munachiso,4020204462,462.jpg,8 October
Nku Miracle,4020204463,463.jpg,29 April
Nkwocha Chikamso Victory,4020204464,464.jpg,8 December
Nnakwe Maryann Ifeyinwa,4020204465,465.jpg,25 September
Nnamani Blessing Odinakachukwu,4020204466,466.jpg,30 October
Nnamani Daniel Uchechukwu,4020204467,467.jpg,6 September
Nnamdi Oluchi Happiness,4020204468,468.jpg,8 August
Nwachukwu Praise Chimemeriwo,4020204469,469.jpg,23 October
Nwafor Charles Chinweike,4020204470,470.jpg,16 May
Nwando Bright Chiagozelam,4020204471,471.jpg,27 March
Nwaogu Amarachi,4020204472,472.jpg,1 March
Nwodom Chidara Blessing,4020204473,473.jpg,6 June
Nyam Agnes Bella,4020204474,474.jpg,1 June
Oba Cherish,4020204475,475.jpg,6 February
Obadiah Veronica Miabdong,4020204476,476.jpg,15 July
Obansa Muhammed,4020204477,477.jpg,16 December
Obasohan Dominion Osaze,4020204478,478.jpg,24 June
Obasuyi Peniel Nosarieme,4020204479,479.jpg,11 September
Obetta Ozioma Light,4020204480,480.jpg,25 July
Obeya Ochidoma Dominic-Juniour,4020204481,481.jpg,2 January
Obi Chiedozie Chidi,4020204482,482.jpg,10 May
Obi Nancy Barong,4020204483,483.jpg,15 November
Obiefuna Marycynthia Ogochukwu,4020204484,484.jpg,8 May
Obikobe Chioma Emmanuella,4020204485,485.jpg,24 November
Obilor Judith Ifeoma,4020204486,486.jpg,19 June
Obinna Miracle,4020204487,487.jpg,7 December
Obinna Perfect,4020204488,488.jpg,9 August
Odii Catherine Munachimso,4020204489,489.jpg,17 September
Odike Simon Ojonugwa,4020204490,490.jpg,13 April
Odoh Michael Chijindu,4020204491,491.jpg,8 April
Odomba Sabdat Ize,4020204492,492.jpg,8 March
Odubiyi Fawaz Daniel,4020204493,493.jpg,10 October
Oduntan Babatunde Kameel,4020204494,494.jpg,4 January
Odutolu Victor Iyanuoluwa,4020204495,495.jpg,24 February
Ofoegbu Goodluck Michael,4020204496,496.jpg,9 October
Ogah Success Omagu,4020204497,497.jpg,7 October
Ogar Regina Ekwork,4020204498,498.jpg,22 June
Ogbode Goodnews,4020204499,499.jpg,1 July
Ogbogo Thankgod Onah,4020204500,500.jpg,29 January
Ogbole David Goodluck,4020204501,501.jpg,29 August
Ogbonna Chidiebere Mary,4020204502,502.jpg,24 August
Ogbonna Ikechukwu Favour,4020204503,503.jpg,18 August
Ogbuagu Mercy,4020204504,504.jpg,26 March
Ogbuefi Chima Michael,4020204505,505.jpg,25 November
Ogenyi Favour Eneh,4020204506,506.jpg,4 July
Ogenyi Patricia Somtochukwu,4020204507,507.jpg,15 March
Ogo Michael Oche,4020204508,508.jpg,3 October
Ogungbe Deborah Eniola,4020204509,509.jpg,10 September
Ogunmokun Cherish Adeyemi,4020204510,510.jpg,4 November
Ogunmola Francis Jomiloju,4020204511,511.jpg,16 May
Ogwuche Augustine Miracle,4020204512,512.jpg,1 December
Ogwurumba Oluomachi Sonia,4020204513,513.jpg,15 December
Ohakwe Favour,4020204514,514.jpg,5 May
Ohikere Abdulbasit Adavize,4020204515,515.jpg,21 October
Oibochie Emmanuel Abaseta,4020204516,516.jpg,11 June
Ojonugwa Eleojo Ireoluwa,4020204517,517.jpg,5 March
Okafor Chiemelie Mary,4020204518,518.jpg,16 September
Okechukwu Felix,4020204519,519.jpg,5 August
Okechukwu Kingsley Nzube,4020204520,520.jpg,9 March
Okechukwu Miracle Nzubechi,4020204521,521.jpg,21 July
Okeke Tovia Ogechukwu,4020204522,522.jpg,6 December
Okeowo Omowunmi Sarah,4020204523,523.jpg,14 March
Okere Naomi Chioma,4020204524,524.jpg,2 June
Okeyede Ahmed Ayomide,4020204525,525.jpg,14 February
Okezue Miracle Chimfurumnanya,4020204526,526.jpg,25 January
Okoli Chikanyima Daniel Chinweuba,4020204527,527.jpg,25 August
Okoli Chinemerem David Orisaemeka,4020204528,528.jpg,25 August
Okoli Evandonald Ekenedilichukwu,4020204529,529.jpg,18 April
Okolo Chiamaka Miracle,4020204530,530.jpg,8 April
Okolo Chikamso Mary-Princess,4020204531,531.jpg,14 October
Okono Sochukwukaima Martin,4020204532,532.jpg,7 October
Okori Blessed Clement,4020204533,533.jpg,16 December
Okoro Kingdavid Onyiekachi,4020204534,534.jpg,5 September
Okoro Luke Chukwuma,4020204535,535.jpg,5 October
Okoromi Osasele Peace,4020204536,536.jpg,20 September
Okoye Onyinyechi Dawnqueen,4020204537,537.jpg,26 September
Okpara Chidimma Meekness,4020204538,538.jpg,14 February
Okpe Mercy,4020204539,539.jpg,28 September
Okuepusu Rebecca Hunuwa,4020204540,540.jpg,19 March
Okunade Adejoke Nafisat,4020204541,541.jpg,1 March
Okusanya Halimat Opemipo,4020204542,542.jpg,10 December
Okwori Jennifer Chinecherem,4020204543,543.jpg,22 May
Olabisi Precious Eniola,4020204544,544.jpg,14 February
Oladele Mustapha Korede,4020204545,545.jpg,6 May
Oladoyinbo Emmanuel Oluseun,4020204546,546.jpg,12 July
Olalere Dominion Oluwatoyin,4020204547,547.jpg,13 November
Olanipekum David Oluwanifemi,4020204548,548.jpg,20 June
Olanipekun Daniel Kayode,4020204549,549.jpg,12 March
Olaojo Elizabeth Oluwanifemi,4020204550,550.jpg,8 December
Olarewaju Ayomide Oreoluwa,4020204551,551.jpg,10 June
Olatunde Mercy Moses,4020204552,552.jpg,22 February
Olawale Benedicta Ebunlomo,4020204553,553.jpg,30 January
Oleru Gabriel Nnameaka,4020204554,554.jpg,16 September
Olorunlomola Oladapo Blessed,4020204555,555.jpg,7 March
Oloruntoba Success,4020204556,556.jpg,24 September
Olugbe Obed Olamilekun,4020204557,557.jpg,27 April
Olusegun Esther Oluwadunsi,4020204558,558.jpg,19 April
Olushola Tobiloba Marvellous,4020204559,559.jpg,23 September
Oluwaseyi Moyin Helen,4020204560,560.jpg,9 February
Omeke Chekwube Emmanuella,4020204561,561.jpg,31 December
Omori Favour Omori,4020204562,562.jpg,9 October
Omorogieva Samuel A,4020204563,563.jpg,22 February
Omorogieva Bliss Nosazena Ifunaya,4020204564,564.jpg,2 April
Omotayo Precious Oreoluwa,4020204565,565.jpg,24 July
Omotayo Sheyi Wisdom,4020204566,566.jpg,2 December
Omowumi Emmanuel Nifemi,4020204567,567.jpg,29 September
Onaji Prosper Ameh,4020204568,568.jpg,12 July
Onalu Chiamaka Elizabeth,4020204569,569.jpg,10 January
Oni Michael Olaniyi,4020204570,570.jpg,18 April
Onowuh Chidiebube Akpuh Micheal,4020204571,571.jpg,29 October
Onuche Godswill Unekwuojo,4020204572,572.jpg,17 June
Onuh Ugbala Jane,4020204573,573.jpg,22 September
Onyeanu Benedict Chidiebube,4020204574,574.jpg,18 September
Onyebuchi Abigail Udochukwu,4020204575,575.jpg,27 November
Onyebuchi Glory Ebubechi,4020204576,576.jpg,15 September
Onyebuchi Jennifer Onyinyechukwu,4020204577,577.jpg,18 January
Onyemaechi Chigozirim Janny,4020204578,578.jpg,5 February
Onyishi Judith Febechukwu,4020204579,579.jpg,24 August
Onyishi Nneoma Ada,4020204580,580.jpg,7 October
Oparinde Johnson Anuoluwapo,4020204581,581.jpg,2 June
Orafu Emmanuel Chimzaram,4020204582,582.jpg,24 December
Oritsetimeyin Eyituoyo Wisdom,4020204583,583.jpg,13 November
Orji Jecinta Chiziterem,4020204584,584.jpg,3 September
Orji Timothy Egwuzoronmachi,4020204585,585.jpg,7 February
Osaigbovo Itohan Faith,4020204586,586.jpg,26 September
Osarenkhoe Nosa Divine,4020204587,587.jpg,16 December
Osigbeme Jeffrey Oshoke,4020204588,588.jpg,22 June
Osigwe Ifeanyi Michael,4020204589,589.jpg,9 December
Osimen Favour Osebhagiajeme,4020204590,590.jpg,25 June
Osukwu Faith Ihuoma,4020204591,591.jpg,20 June
Otigba Ngozi Favour,4020204592,592.jpg,24 August
Otsonu Grace Ene,4020204593,593.jpg,23 February
Otu Divine Muji,4020204594,594.jpg,3 June
Otuyemi Oyinkansola Faith,4020204595,595.jpg,30 November
Owusu Isaac Ansah,4020204596,596.jpg,25 April
Oyeleke Oluwatosin Patience,4020204597,597.jpg,7 May
Oyetakin Joseph,4020204598,598.jpg,30 January
Oyetokun Olatunji Emmanuel,4020204599,599.jpg,5 February
Oyewole David Olamiposi,4020204600,600.jpg,6 May
Oyeyemi Oluwafisayomi Omotade,4020204601,601.jpg,3 October
Ozioko Emmanuel Chidera,4020204602,602.jpg,10 December
Oziri Chukwubuike Michael,4020204603,603.jpg,6 July
Paul Oyiza Rebecca,4020204604,604.jpg,21 November
Peter Favour,4020204605,605.jpg,13 May
Peter Miracle Nmerichukwu,4020204606,606.jpg,28 September
Peterson Daniel,4020204607,607.jpg,24 May
Philip Gideon Chukwuemeka,4020204608,608.jpg,21 July
Polycarp Blessing Bassey,4020204609,609.jpg,4 February
Rahmatu Umar,4020204610,610.jpg,1 October
Rasheed Aliyah Adewunmi,4020204611,611.jpg,30 September
Rotimi Joshua Olatunji,4020204612,612.jpg,22 October
Royal Onyebuchi Ewomazino,4020204613,613.jpg,16 January
Sadiq Hafsat Ometere,4020204614,614.jpg,13 June
Saibu Kayode Tunde,4020204615,615.jpg,22 October
Saidu Anas Ahmad,4020204616,616.jpg,10 March
Salami Anjola Oluwa Bashirat,4020204617,617.jpg,23 June
Salihu Abdullahi Kabir,4020204618,618.jpg,23 June
Sam Daniel Monokpo,4020204619,619.jpg,20 June
Sampson Kelechi Victory,4020204620,620.jpg,28 April
Samson Ayobami Victory,4020204621,621.jpg,30 October
Samson Bright Chibueze,4020204622,622.jpg,26 May
Samson Michael Kolo,4020204623,623.jpg,17 July
Samuel Divine Oluwakemi,4020204624,624.jpg,14 April
Samuel Favour Okon,4020204625,625.jpg,30 August
Samuel Mercy Chidera,4020204626,626.jpg,2 October
Samuel Oluwaseyi Isaac,4020204627,627.jpg,12 December
Samuel Udo Miracle Uchanma,4020204628,628.jpg,7 February
Sani Sa'adatu Ja'afaru,4020204629,629.jpg,24 June
Shaibu Fatima Oyiza,4020204630,630.jpg,5 August
Shaibu Peace Ojomugbokenyode,4020204631,631.jpg,27 November
Shefiu-Badmos Zainab Motunrayo,4020204632,632.jpg,27 May
Shehu Ibrahim Utono,4020204633,633.jpg,5 October
Shehu Maryam Alake,4020204634,634.jpg,26 December
Shodolamu Bilikisu Ajoke,4020204635,635.jpg,25 March
Showunmi Tolulope Prisca,4020204636,636.jpg,4 September
Shuaibu Jibril,4020204637,637.jpg,9 November
Sigah Shalom,4020204638,638.jpg,6 July
Silas Plangnan Dakup,4020204639,639.jpg,11 September
Simeon Rita Ojone,4020204640,640.jpg,13 April
Siyaka Husseina Oyiza,4020204641,641.jpg,17 November
Solomon Judith,4020204642,642.jpg,5 October
Stanley Deborah Elohozino,4020204643,643.jpg,6 October
Stephen Divine Chisom,4020204644,644.jpg,9 April
Stephen Ofure Laurena,4020204645,645.jpg,10 April
Suleiman Khadijat Habibu,4020204646,646.jpg,5 September
Sunday David Oloche,4020204647,647.jpg,22 February
Sunday Divine Ugbedeojo,4020204648,648.jpg,25 May
Sunday Emmanuel,4020204649,649.jpg,1 September
Sunday Favour Boluwatife,4020204650,650.jpg,4 February
Sunday Joy,4020204651,651.jpg,7 January
Sunday Selina,4020204652,652.jpg,27 June
Sunusi Fatima Muhammad,4020204653,653.jpg,13 April
Surajudeen Abdulbaqi Gbolahan,4020204654,654.jpg,8 March
Tahiru Firdausi Ojimaojo,4020204655,655.jpg,2 September
Taiwo Princess Elizabeth,4020204656,656.jpg,15 September
Taiwo Samuel Ayomiposy,4020204657,657.jpg,29 December
Taofiq Abubakar-Sadiq Akanbi,4020204658,658.jpg,6 October
Tego Esther Inemesit,4020204659,659.jpg,21 January
Teslim Jemilat Bolanle,4020204660,660.jpg,5 May
Thompson Treasure Isioma,4020204661,661.jpg,31 August
Tiamiyu Fawziyyah Omotayo,4020204662,662.jpg,6 January
Tolorunloba Victory Nifemi,4020204663,663.jpg,2 February
Toni-Nnamani Nneoma Frances,4020204664,664.jpg,15 September
Uaifo Gabriel Aidolojie,4020204665,665.jpg,20 November
Uche Chidimma Mercy,4020204666,666.jpg,19 September
Uchenna Ephraim Kwenyerechukwu,4020204667,667.jpg,7 May
Udekwe Daniel Okeanyichukwu,4020204668,668.jpg,17 October
Uduehi Gabriel Ohiole,4020204669,669.jpg,17 August
Ufot Edidiong Akpankan,4020204670,670.jpg,19 February
Ufuoma Deborah Eseoghene,4020204671,671.jpg,10 February
Ugochukwu Chidera Emmanuel,4020204672,672.jpg,25 February
Ugochukwu Christiana Anulika,4020204673,673.jpg,4 November
Ugochukwu Elijah Praise,4020204674,674.jpg,1 September
Ugwoke Chisom Blessing,4020204675,675.jpg,25 April
Ugwu Dikachi Emmanuel,4020204676,676.jpg,30 August
Ugwu Jennifer Chukwuemerie,4020204677,677.jpg,26 November
Ugwu Onyinyechukwu Lucy,4020204678,678.jpg,26 September
Ugwuanyi Love Ngozi,4020204679,679.jpg,10 December
Ugwueze Chioma Gift,4020204680,680.jpg,15 May
Uhalla Favour Francisca,4020204681,681.jpg,1 March
Ukeje Mercy Ezinne,4020204682,682.jpg,9 April
Umar Halima Faruk,4020204683,683.jpg,1 August
Umar Yusuf Faruk,4020204684,684.jpg,3 January
Umaru Gift Eleojo,4020204685,685.jpg,8 April
Umeh Victory Chidiebube,4020204686,686.jpg,18 February
Urum Samuel Udochukwu,4020204687,687.jpg,15 July
Ushie Victor Chigozie,4020204688,688.jpg,27 May
Usman Abdullahi Baba,4020204689,689.jpg,20 September
Usman Fatimatu Zaharau,402020490,690.jpg,22 November
Usman Suraiya,4020204691,691.jpg,4 June
Uthman Muhammad Maidala,4020204692,692.jpg,3 February
Uwai Daniel,4020204693,693.jpg,30 September
Uyanwanne Nnamdi Benedict,4020204694,694.jpg,15 September
Uyoo Mary Myom,4020204695,695.jpg,15 December
Uzodiagu Precious Chidera,4020204696,696.jpg,25 June
Uzodimma Favour Adachukwu,4020204697,697.jpg,19 August
Uzoma Obiajulu Favour Joshua,4020204698,698.jpg,6 May
Uzowulu Lucky Tochukwu,4020204699,699.jpg,8 August
Victor Chukwunyere Victor,4020204700,700.jpg,11 July
Vongfa Nanhan Holiness,4020204701,701.jpg,3 March
Williams Miracle Osamone,4020204702,702.jpg,10 April
Yahaya Khadijat Ekkan,4020204703,703.jpg,15 February
Yahaya Ummulhaq Salihu,4020204704,704.jpg,13 May
Yakubu Aliyu Yakubu,4020204705,705.jpg,28 December
Yakubu Julde Jabir,4020204706,706.jpg,3 November
Yanmelu Hembafan Perpetual,4020204707,707.jpg,7 March
Young Praisegod Ezionyinye,4020204708,708.jpg,22 June
Yunana Jummai Lukpo,4020204709,709.jpg,4 May
Yusuf Korede,4020204710,710.jpg,10 March
Yusuf Nafisat,4020204711,711.jpg,27 August
Yusuf Shalom Praise,4020204712,712.jpg,25 July
Yusuf Yusuf Namallam,4020204713,713.jpg,22 December
Zubair Mukhtaar Olashubomi,4020204714,714.jpg,14 January`;

export const getInitialStudents = (): Student[] => {
  const lines = rawCSV.trim().split('\n');
  if (lines.length <= 1) return [];

  const list: Student[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',');
    const fullName = values[0]?.trim() || '';
    const examNumber = values[1]?.trim() || '';
    const photoFilename = values[2]?.trim() || '';
    const birthDate = values[3]?.trim() || '';

    if (fullName && examNumber) {
      list.push({
        id: examNumber,
        fullName,
        examNumber,
        photoFilename: (photoFilename || `${i}.webp`).replace(/\.(jpe?g|png)$/i, '.webp'),
        birthDate: birthDate || '1 January',
        votes: {
          tech_guru: 0,
          most_creative: 0,
          class_scholar: 0,
          most_famous: 0,
          best_smile: 0,
          next_ceo: 0,
          style_icon: 0,
          class_comedian: 0,
          sports_mvp: 0,
          quiet_achiever: 0,
          world_traveler: 0,
          unsung_hero: 0
        },
        quote: "Excellence is not a destination, it's a way of life. GSS Kubwa Class of 2026!"
      });
    }
  }
  return list;
};

export const seedStudentsToFirestore = async () => {
  try {
    const lines = rawCSV.trim().split('\n');
    if (lines.length <= 1) return 0;

    let batch = writeBatch(db);
    let count = 0;
    let batchCount = 0;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const examNumber = values[1]?.trim() || `4020204${i.toString().padStart(3, '0')}`;
      const student = {
        fullName: values[0]?.trim() || '',
        examNumber,
        photoFilename: (values[2]?.trim() || `${i}.webp`).replace(/\.(jpe?g|png)$/i, '.webp'),
        birthDate: values[3]?.trim() || '',
        votes: {
          tech_guru: 0,
          most_creative: 0,
          class_scholar: 0,
          most_famous: 0,
          best_smile: 0,
          next_ceo: 0,
          style_icon: 0,
          class_comedian: 0,
          sports_mvp: 0,
          quiet_achiever: 0,
          world_traveler: 0,
          unsung_hero: 0
        },
        quote: "Excellence is not a destination, it's a way of life. GSS Kubwa Class of 2026!",
        createdAt: new Date()
      };

      const studentRef = doc(db, 'students', student.examNumber);
      batch.set(studentRef, student);
      
      count++;
      batchCount++;

      // Commit at 400 to be safe
      if (batchCount === 400) {
        await batch.commit();
        console.log(`Intermediate Batch of ${batchCount} committed...`);
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`Final batch committed. Total: ${count} students.`);
    return count;
  } catch (error) {
    console.error("Error seeding database: ", error);
    throw error;
  }
};
