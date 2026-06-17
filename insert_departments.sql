-- ============================================================
-- Insert missing departments into digital.Department
-- Run this in Azure SQL Query Editor
-- Existing rows: 1-Sales(B2C), 2-Sales(B2B), 3-CEO Office,
--                4-Digital(Automation), 5-MD Office
-- ============================================================

INSERT INTO digital.Department (dept_name, subdivision, apex_lead, apex_email, apex_phone, created_at, updated_at)
VALUES
  -- SCM subdivisions
  ('SCM',       'Logistics',    'SCM Lead',       'scm@sintex.com',        '+919900000010', GETDATE(), GETDATE()),
  ('SCM',       'PPI',          'SCM Lead',       'scm@sintex.com',        '+919900000010', GETDATE(), GETDATE()),
  ('SCM',       'Procurement',  'SCM Lead',       'scm@sintex.com',        '+919900000010', GETDATE(), GETDATE()),
  ('SCM',       'PPC',          'SCM Lead',       'scm@sintex.com',        '+919900000010', GETDATE(), GETDATE()),

  -- HR subdivisions
  ('HR',        'Admin',        'HR Lead',        'hr@sintex.com',         '+919900000011', GETDATE(), GETDATE()),
  ('HR',        'Training',     'HR Lead',        'hr@sintex.com',         '+919900000011', GETDATE(), GETDATE()),

  -- Standalone departments
  ('Marketing', 'Marketing',    'Marketing Lead', 'marketing@sintex.com',  '+919900000012', GETDATE(), GETDATE()),
  ('Finance',   'Finance',      'Finance Lead',   'finance@sintex.com',    '+919900000013', GETDATE(), GETDATE()),
  ('Services',  'Services',     'Services Lead',  'services@sintex.com',   '+919900000014', GETDATE(), GETDATE());

-- Verify result
SELECT dept_id, dept_name, subdivision FROM digital.Department ORDER BY dept_id;
