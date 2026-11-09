# NSH BARBER AI — Backend starter

## ត្រូវមាន
- Node.js 20 ឬថ្មីជាងនេះ
- OpenAI API key ដែលមាន API billing/credit

## ដំណើរការលើកុំព្យូទ័រ
1. Extract ZIP.
2. បើក Terminal នៅក្នុងថតនេះ ហើយរត់ `npm install`.
3. ចម្លង `.env.example` ទៅជា `.env`.
4. បើក `.env` ហើយដាក់ API key នៅ `OPENAI_API_KEY=...`។ កុំផ្ញើ key ឱ្យអ្នកដទៃ និងកុំដាក់ក្នុង `public/`.
5. រត់ `npm start`.
6. បើក `http://localhost:3000`.

## ដាក់ Online
Deploy ថតនេះទៅ Node.js hosting ដែលអ្នកទុកចិត្ត។ កំណត់ Environment Variables នៅ Hosting Dashboard:
- `OPENAI_API_KEY` = API key របស់អ្នក
- `OPENAI_MODEL` = `gpt-5.5` (ប្ដូរបានទៅ model ដែលមានសិទ្ធិប្រើក្នុង project របស់អ្នក)
- `NODE_ENV` = `production`

បន្ទាប់ពី deploy រួច បើក HTTPS URL របស់ Hosting នៅ Safari លើ iPhone ហើយអាច Add to Home Screen បាន។

## សុវត្ថិភាព និងភាពឯកជន
- API key រក្សាទុកតែនៅ server ក្នុង environment variable; មិនបញ្ជូនទៅ browser។
- Endpoint មាន rate limit និងកំណត់ upload 8MB; production គួរបន្ថែម authentication, user consent, retention/deletion policy, HTTPS និង monitoring។
- រូបថតភ្ញៀវត្រូវបានផ្ញើទៅ OpenAI ដើម្បីវិភាគ។ សុំការយល់ព្រមមុន upload ហើយកុំប្រើរូបដោយគ្មានការអនុញ្ញាត។
- នេះជាគំរូដំបូង មិនទាន់មាន database, login, virtual hairstyle image editing ឬការវាស់ក្បាល 3D។
- API usage មានការគិតថ្លៃដាច់ដោយឡែកតាម model និងការប្រើប្រាស់។

## API
`POST /api/analyze` multipart form-data:
- `photo`: JPEG/PNG/WEBP
- `hairType`, `length`, `styleGoal`, `colorGoal`
