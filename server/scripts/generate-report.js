import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Output to the project root
const outputPath = path.join(__dirname, '..', '..', 'Projectra_App_Report.pdf')

console.log('Script directory:', __dirname)
console.log('Output path:', outputPath)
console.log('Output directory exists:', fs.existsSync(path.dirname(outputPath)))

// Check if PDFKit is properly installed
try {
    console.log('PDFDocument available:', typeof PDFDocument)
} catch (e) {
    console.error('PDFKit import error:', e)
    process.exit(1)
}

// Current local date/time passed by the user context (fallback to system time)
const now = new Date()
const fmt = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
}).format(now)

function addSectionTitle(doc, text) {
    doc.moveDown(0.6)
    doc.fontSize(16).fillColor('#222').text(text, { underline: true })
    doc.moveDown(0.3)
    doc.fontSize(11).fillColor('#000')
}

function addList(doc, items) {
    items.forEach((item) => {
        doc.text(`• ${item}`)
    })
}

function generate() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Starting PDF generation...')

            const doc = new PDFDocument({
                margin: 50,
                info: {
                    Title: 'ProJectra App Report',
                    Author: 'ProJectra Generator'
                }
            })

            const stream = fs.createWriteStream(outputPath)

            stream.on('error', (err) => {
                console.error('Write stream error:', err)
                reject(err)
            })

            stream.on('finish', () => {
                console.log('PDF written successfully')
                console.log('File size:', fs.statSync(outputPath).size, 'bytes')
                resolve(outputPath)
            })

            doc.pipe(stream)

            console.log('Adding content to PDF...')

            // Title
            doc.fontSize(22).fillColor('#000').text('ProJectra — Application Summary Report', { align: 'left' })
            doc.moveDown(0.2)
            doc.fontSize(11).fillColor('#444').text(`Generated: ${fmt}`)
            doc.moveDown(1)

            // Overview
            addSectionTitle(doc, '1. Overview')
            doc.text('ProJectra is a full‑stack project management application with a React (Vite) frontend and a Node.js/Express/MongoDB backend. The app includes authentication, role‑based access for project operations, real‑time sockets, and AI‑assisted features with rate‑limited endpoints.')

            // Architecture
            addSectionTitle(doc, '2. Architecture & Tech Stack')
            addList(doc, [
                'Frontend: React + TypeScript (Vite).',
                'Backend: Node.js + Express with MongoDB (Mongoose).',
                'Auth: JWT with bearer token stored in localStorage (key: pj_access_token).',
                'Security middleware: helmet, cors, express-rate-limit, cookie-parser.',
                'Real-time: Socket.IO integrated on the server.',
            ])

            // Backend API summary
            addSectionTitle(doc, '3. Backend API Summary (Major Route Groups)')
            addList(doc, [
                'Auth:    /api/auth  — login, register, me, etc.',
                'Users:   /api/users — profile update and management.',
                'Teams:   /api/teams — team CRUD.',
                'Projects:/api/projects — list, create (role‑based), get, update, delete, reporting.',
                'Tasks:   /api/tasks — task CRUD and status updates.',
                'Admin:   /api/admin — administrative actions.',
                'Misc/Net:/api (misc.routes, network.routes) — health and misc endpoints.',
                'Perf:    /api/performance — performance checks.',
                'AI:      /api/ai — AI assistant features with rate limiting.',
            ])

            // AI Routes
            addSectionTitle(doc, '4. AI Endpoints (/api/ai)')
            addList(doc, [
                'GET /health — AI service health check.',
                'POST /chat — general AI chat.',
                'POST /task-assistance — contextual help for tasks.',
                'POST /project-onboarding — onboarding assistance for projects.',
                'POST /skill-development — suggestions for skill growth.',
            ])
            doc.moveDown(0.2)
            doc.text('All AI endpoints are protected by authentication and an hourly rate‑limit (default: 100 requests/hour, configurable via AI_RATE_LIMIT_PER_HOUR).')

            // Frontend features
            addSectionTitle(doc, '5. Frontend Features')
            addList(doc, [
                'Header: global search (focus with "/"), quick navigation (press B to open Board), notifications, AI panel toggle.',
                'AuthContext: persists JWT and basic user info in localStorage; provides login/logout helpers.',
                'Route protection: ProtectedRoute redirects unauthenticated users to /login.',
                'Projects page: lists projects via /api/projects, allows creating new projects (name, description).',
                'Profile page: fetches /auth/me and updates /users/me (name, avatar, preferences like theme and notifications).',
            ])

            // Security & Middleware
            addSectionTitle(doc, '6. Security, Middleware & Rate Limiting')
            addList(doc, [
                'helmet for security headers; cors with configurable origins.',
                'express-rate-limit on /api/auth and AI endpoints.',
                'morgan request logging; cookie-parser; JSON body parser (2MB).',
                'Role-based authorization for project mutations (Admin, ProjectManager).',
            ])

            // Sockets
            addSectionTitle(doc, '7. Realtime (Socket.IO)')
            doc.text('The server initializes a Socket.IO instance and logs connection/disconnection events. This enables future real‑time features such as live task updates or notifications.')

            // How to run
            addSectionTitle(doc, '8. How to Generate This PDF')
            addList(doc, [
                'Install deps: npm run install:all',
                'From the repo root, run: npm run generate:report',
                'The PDF will be saved as Projectra_App_Report.pdf in the repository root.'
            ])

            // Appendix
            addSectionTitle(doc, '9. Appendix: Environment & Build')
            addList(doc, [
                'Server dev: npm run server',
                'Client dev: npm run client',
                'Build client: npm run client:build',
                'Run both dev servers concurrently (Windows helper): npm run dev:win',
            ])

            console.log('Finalizing PDF...')
            doc.end()

        } catch (error) {
            console.error('Error during PDF generation:', error)
            reject(error)
        }
    })
}

try {
    console.log('Running PDF generation script...')
    const out = await generate()
    console.log(`✅ Report generated successfully at: ${out}`)

    // Verify file exists and show stats
    if (fs.existsSync(out)) {
        const stats = fs.statSync(out)
        console.log(`📄 File size: ${stats.size} bytes`)
        console.log(`📅 Created: ${stats.birthtime}`)
    } else {
        console.error('❌ PDF file was not created at expected location')
    }
} catch (e) {
    console.error('❌ Failed to generate report:', e)
    process.exitCode = 1
}
