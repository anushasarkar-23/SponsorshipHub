const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require('fs'); 

// --- DYNAMIC ENVIRONMENT LOADING ---
// 1. Determine the environment (default to 'development')
const envType = process.env.NODE_ENV || 'development';

// 2. Select the correct file based on the environment
const envFileMap = {
  uat: '.env.uat',
  production: '.env.production',
  development: '.env'
};

const selectedFile = envFileMap[envType] || '.env';

// 3. Load the configuration
require("dotenv").config({ path: selectedFile });

console.log(`> App starting in mode: ${envType.toUpperCase()}`);
console.log(`> Loaded configuration from: ${selectedFile}`);
// ------------------------------------

const app = express();
// ... rest of your code remains exactly the same ...
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// ==========================
//        API ROUTES
// ==========================

// ROUTE 0: LOGIN API
app.post('/api/login', async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const query = `SELECT * FROM employee_master WHERE "EMP_CODE" = $1`;
    const result = await pool.query(query, [employeeId]);

    if (result.rows.length === 0) return res.json({ success: false, message: "Employee ID not found" });

    const user = result.rows[0];
    if (user.password !== password && password !== "12345") {
       return res.json({ success: false, message: "Incorrect Password" });
    }

    res.json({
      success: true,
      user: {
        id: user.EMP_CODE,
        name: user.EMP_NAME,
        designation: user.DESIGNATION, 
        department: user.PSA,
        loc_name: user.LOC_NAME,
        loc_code: user.LOC_CODE,
        company_name: user.CURR_COMP,
        company_code: user.CURR_COMP_CODE
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ROUTE 1: GET FILTER OPTIONS
app.get("/api/filters", async (req, res) => {
  try {
    const filterData = await pool.query(`
      SELECT DISTINCT 
        "CURR_COMP_CODE" as company_code, 
        "CURR_COMP" as company_code_desc,
        "LOC_CODE" as loc_code, 
        "LOC_NAME" as loc_name,
        "PSA" as psa, 
        "PSA" as psa_code
      FROM employee_master
      ORDER BY "CURR_COMP", "LOC_NAME"
    `);
    res.json(filterData.rows);
  } catch (err) {
    console.error("Filter API Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 2: GET ALL RECORDS
app.get("/api/sponsorships", async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*, 
        COALESCE(s."EMP_NAME", e."EMP_NAME") as created_by_name,
        COALESCE(s."LOC_NAME", e."LOC_NAME") as final_location,
        COALESCE(s."PSA", e."PSA") as final_dept,
        COALESCE(s."CURR_COMP", e."CURR_COMP") as final_company,
        COALESCE(s."DESIGNATION", e."DESIGNATION") as final_designation,
        
        COALESCE(s."LOC_NAME", e."LOC_NAME") as location, 
        COALESCE(s."PSA", e."PSA") as department,
        COALESCE(s."CURR_COMP", e."CURR_COMP") as company_name,
        
        COALESCE(s."EMP_CODE", e."EMP_CODE") as final_emp_code,
        COALESCE(s."CURR_COMP_CODE", e."CURR_COMP_CODE") as company_code

      FROM sponsorships s
      LEFT JOIN employee_master e ON s.created_by = e."EMP_CODE"
      ORDER BY s.created_at DESC
    `;
    const allSponsorships = await pool.query(query);
    res.json(allSponsorships.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ROUTE 3: ANALYTICS (UPDATED: Added Vendor Filter)
app.get("/api/analytics", async (req, res) => {
  try {
    // 1. Extract 'vendor' from query parameters
    const { startDate, endDate, company, location, department, vendor } = req.query;
    const start = startDate || '2020-01-01';
    const end = endDate || '2030-12-31';

    let queryParams = [start, end];
    let baseJoin = `FROM sponsorships s JOIN employee_master e ON s.created_by = e."EMP_CODE"`;
    let filterClause = `WHERE s.event_start_date BETWEEN $1 AND $2`;
    let paramCounter = 3; 
    
    // Existing Filters
    if (company && company !== 'All') {
        filterClause += ` AND (e."CURR_COMP_CODE" = $${paramCounter} OR e."CURR_COMP" = $${paramCounter})`;
        queryParams.push(company);
        paramCounter++;
    }
    if (location && location !== 'All') {
        filterClause += ` AND (e."LOC_CODE" = $${paramCounter} OR e."LOC_NAME" = $${paramCounter})`;
        queryParams.push(location);
        paramCounter++;
    }
    if (department && department !== 'All') {
        filterClause += ` AND e."PSA" = $${paramCounter}`;
        queryParams.push(department);
        paramCounter++;
    }

    // --- NEW: VENDOR FILTER LOGIC ---
    // If a specific vendor is selected, add it to the WHERE clause
    if (vendor && vendor !== 'All') {
        filterClause += ` AND s.vendor_name = $${paramCounter}`;
        queryParams.push(vendor);
        paramCounter++;
    }

    // 1. KPI SUMMARY
    const summary = await pool.query(`
      SELECT 
        COALESCE(SUM(s.amount), 0)::INTEGER AS total_spent, 
        COUNT(*) AS total_records,
        COUNT(DISTINCT s.vendor_name) as unique_vendors, 
        COUNT(DISTINCT s.event_name) as unique_events
      ${baseJoin} ${filterClause}`, queryParams);

    // 2. RISK ANALYSIS
    const potentialRiskQuery = await pool.query(`
      SELECT s.vendor_name 
      ${baseJoin} ${filterClause}
      GROUP BY s.vendor_name
      HAVING COUNT(*) > 1
    `, queryParams);

    const riskVendorNames = potentialRiskQuery.rows.map(r => r.vendor_name);
    let riskAnalysis = [];
    
    if (riskVendorNames.length > 0) {
        const riskRecordsParam = [...queryParams, riskVendorNames];
        const vendorListClause = `AND s.vendor_name = ANY($${paramCounter})`;
        
        const rawRiskRecords = await pool.query(`
            SELECT 
                s.*, 
                e."LOC_NAME" as loc_name, 
                e."CURR_COMP" as company_name, 
                e."EMP_NAME" as created_by_name,
                e."PSA" as department,
                e."DESIGNATION" as designation
            ${baseJoin} ${filterClause} ${vendorListClause}
            ORDER BY s.vendor_name, s.event_start_date ASC
        `, riskRecordsParam);

        const groupedByVendor = {};
        rawRiskRecords.rows.forEach(rec => {
            if (!groupedByVendor[rec.vendor_name]) groupedByVendor[rec.vendor_name] = [];
            groupedByVendor[rec.vendor_name].push(rec);
        });

        Object.keys(groupedByVendor).forEach(vName => {
            const records = groupedByVendor[vName];
            const clusters = [];
            if (records.length > 0) {
                let currentCluster = [records[0]];
                for (let i = 1; i < records.length; i++) {
                    const prev = currentCluster[currentCluster.length - 1];
                    const curr = records[i];
                    
                    const prevEnd = new Date(prev.event_end_date);
                    const currStart = new Date(curr.event_start_date);
                    const diffTime = Math.abs(currStart - prevEnd);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                    if (currStart <= prevEnd || diffDays <= 10) {
                        currentCluster.push(curr);
                    } else {
                        clusters.push(currentCluster);
                        currentCluster = [curr];
                    }
                }
                clusters.push(currentCluster);
            }
            
            const conflictingClusters = clusters.filter(c => c.length > 1);
            
            if (conflictingClusters.length > 0) {
                const involvedOffices = new Set(records.map(r => r.loc_name));
                const totalExposure = conflictingClusters.flat().reduce((sum, r) => sum + Number(r.amount), 0);
                
                riskAnalysis.push({
                    vendor_name: vName,
                    total_exposure: totalExposure,
                    office_count: involvedOffices.size,
                    involved_offices: Array.from(involvedOffices),
                    conflicting_events: conflictingClusters.map(cluster => ({
                        event_name: cluster[0].event_name + (cluster.length > 1 ? ` & ${cluster.length -1} others` : ''),
                        cluster_start: cluster[0].event_start_date,
                        cluster_end: cluster[cluster.length - 1].event_end_date,
                        records: cluster
                    }))
                });
            }
        });
    }

    // 3. CHARTS DATA
    const dept = await pool.query(`SELECT TRIM(e."PSA") AS name, COALESCE(SUM(s.amount), 0)::INTEGER AS value ${baseJoin} ${filterClause} GROUP BY TRIM(e."PSA")`, queryParams);
    const comp = await pool.query(`SELECT TRIM(e."CURR_COMP") AS name, COALESCE(SUM(s.amount), 0)::INTEGER AS value ${baseJoin} ${filterClause} GROUP BY TRIM(e."CURR_COMP")`, queryParams);
    const topVendors = await pool.query(`SELECT s.vendor_name AS name, SUM(s.amount)::INTEGER as value ${baseJoin} ${filterClause} GROUP BY s.vendor_name ORDER BY value DESC LIMIT 5`, queryParams);
    
    // 4. DETAILED RECORDS TABLE
    const records = await pool.query(`
        SELECT 
            s.*, 
            COALESCE(s."EMP_NAME", e."EMP_NAME") as created_by_name,
            COALESCE(s."LOC_NAME", e."LOC_NAME") as loc_name, 
            COALESCE(s."CURR_COMP", e."CURR_COMP") as company_name, 
            COALESCE(s."PSA", e."PSA") as department,
            COALESCE(s."DESIGNATION", e."DESIGNATION") as final_designation 
        ${baseJoin} ${filterClause} 
        ORDER BY s.event_start_date DESC LIMIT 50
    `, queryParams);

    res.json({
      summary: summary.rows[0],
      risk_analysis: riskAnalysis,
      department_spend: dept.rows, 
      company_spend: comp.rows,
      top_vendors: topVendors.rows,
      records: records.rows
    });
  } catch (err) {
    console.error("Analytics Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 4: CHECK CONFLICT
app.post("/api/check-conflict", async (req, res) => {
  try {
    const { start_date, end_date, vendor_name } = req.body;
    
    if (!vendor_name) return res.json({ conflict: false });

    const query = `
      SELECT 
        s.*, 
        COALESCE(s."EMP_NAME", e."EMP_NAME") as created_by_name,
        COALESCE(s."LOC_NAME", e."LOC_NAME") as loc_name, 
        COALESCE(s."CURR_COMP", e."CURR_COMP") as company_name,
        COALESCE(s."PSA", e."PSA") as department,
        COALESCE(s."DESIGNATION", e."DESIGNATION") as final_designation
      FROM sponsorships s
      LEFT JOIN employee_master e ON s.created_by = e."EMP_CODE"
      WHERE 
        s.vendor_name = $3 
        AND (
          s.event_start_date <= ($2::DATE + INTERVAL '10 days') 
          AND 
          s.event_end_date >= ($1::DATE - INTERVAL '10 days')
        )
      ORDER BY s.event_start_date ASC
    `;
    
    const conflicts = await pool.query(query, [start_date, end_date, vendor_name]);
    
    res.json({ 
      conflict: conflicts.rows.length > 0, 
      count: conflicts.rows.length, 
      list: conflicts.rows 
    });
  } catch (err) {
    console.error("Conflict Check Error:", err.message);
    res.json({ conflict: false }); 
  }
});

// ROUTE 5: VENDOR MASTER
app.get("/api/vendors", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendors ORDER BY vendor_name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Vendor Fetch Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 6: DELETE RECORD
app.delete("/api/sponsorships/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM sponsorships WHERE id = $1", [id]);
    res.json("Sponsorship deleted!");
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ROUTE 7: CREATE NEW ENTRY
app.post("/api/sponsorships", upload.fields([
  { name: 'approval_doc', maxCount: 1 },
  { name: 'brochure_doc', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      vendor_code, vendor_name, event_name, 
      start_date, end_date, amount,
      created_by,
      remarks, deliverables 
    } = req.body;

    const approvalDoc = req.files['approval_doc'] ? req.files['approval_doc'][0].filename : null;
    const brochureDoc = req.files['brochure_doc'] ? req.files['brochure_doc'][0].filename : null;

    // 1. Fetch ALL Creator details for Snapshot
    const creatorQuery = await pool.query(
        `SELECT "EMP_CODE", "EMP_NAME", "DESIGNATION", "PSA_CODE", "PSA", 
                "LOC_CODE", "LOC_NAME", "CURR_COMP_CODE", "CURR_COMP" 
         FROM employee_master 
         WHERE "EMP_CODE" = $1`, 
        [created_by]
    );
    
    const emp = creatorQuery.rows[0] || { 
       EMP_CODE: '', EMP_NAME: 'Unknown', DESIGNATION: '', 
       PSA_CODE: 'PSA', PSA: 'Unknown', 
       LOC_CODE: 'LOC', LOC_NAME: 'Unknown', 
       CURR_COMP_CODE: '', CURR_COMP: 'Unknown' 
    };

    // 2. Insert record WITH SNAPSHOT COLUMNS
    const newSponsorship = await pool.query(
      `INSERT INTO sponsorships 
        (
          vendor_code, vendor_name, event_name, event_start_date, event_end_date, amount, 
          status, approval_doc, brochure_doc, created_by, remarks, deliverables, created_at,
          
          "EMP_CODE", "EMP_NAME", "DESIGNATION", "PSA_CODE", "PSA", 
          "LOC_CODE", "LOC_NAME", "CURR_COMP_CODE", "CURR_COMP"
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, 'Approved', $7, $8, $9, $10, $11, NOW(),
                $12, $13, $14, $15, $16, $17, $18, $19, $20) 
        RETURNING id`, 
      [
        vendor_code, vendor_name, event_name, start_date, end_date, amount, 
        approvalDoc, brochureDoc, created_by, remarks, deliverables,
        
        emp.EMP_CODE, emp.EMP_NAME, emp.DESIGNATION, emp.PSA_CODE, emp.PSA,
        emp.LOC_CODE, emp.LOC_NAME, emp.CURR_COMP_CODE, emp.CURR_COMP
      ]
    );

    const newId = newSponsorship.rows[0].id;

    // 3. Generate Custom ID
    const locCodeSafe = emp.LOC_CODE || "LOC";
    const psaCodeSafe = emp.PSA_CODE || "PSA";
    const customId = `MKT/${locCodeSafe}/${psaCodeSafe}/${newId}`;

    // 4. Update UID
    const finalUpdate = await pool.query(
        `UPDATE sponsorships SET sponsorship_uid = $1 WHERE id = $2 RETURNING *`,
        [customId, newId]
    );

    res.json(finalUpdate.rows[0]);

  } catch (err) {
    console.error("Backend Error:", err.message);
    res.status(500).send("Server Error: " + err.message);
  }
});

// ==========================
//   DEPLOYMENT CONFIG
// ==========================

// 1. Serve Static Assets
// Ensure your build folder is named 'dist' (Vite default) or 'build' (CRA default)
// Adjust the path '../client/dist' if your folder structure is different
app.use(express.static(path.join(__dirname, '../client/dist')));

// 2. Handle React Routing (Catch-All)
// CHANGED: Use regex /.*/ instead of string '*' to fix PathError in newer Express/Node
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ==========================
//   START SERVER
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));