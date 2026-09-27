-- 1. Enable Row-Level Security on operational tables
ALTER TABLE production_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blasting_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- 2. Create the Site Manager policies
-- They can only SELECT, INSERT, UPDATE rows where mine_id matches their session variable
CREATE POLICY site_manager_production_entries_policy 
ON production_entries
FOR ALL
USING (
    current_setting('app.current_mine_id', true) = mine_id 
    OR current_setting('app.current_user_role', true) = 'admin'
);

CREATE POLICY site_manager_blasting_events_policy 
ON blasting_events
FOR ALL
USING (
    current_setting('app.current_mine_id', true) = mine_id 
    OR current_setting('app.current_user_role', true) = 'admin'
);

CREATE POLICY site_manager_reports_policy 
ON generated_reports
FOR ALL
USING (
    current_setting('app.current_mine_id', true) = mine_id 
    OR current_setting('app.current_user_role', true) = 'admin'
);

-- 3. Create the strictly restricted read-only role for Industry Viewers
-- This role is completely denied access to internal operational data.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'industry_readonly') THEN
        CREATE ROLE industry_readonly NOLOGIN;
    END IF;
END
$$;

-- Grant access ONLY to high-level/safe views (e.g. value_forecast)
GRANT SELECT ON value_forecast TO industry_readonly;
GRANT SELECT ON price_tiers TO industry_readonly;
GRANT SELECT ON generated_reports TO industry_readonly;

-- Explicitly revoke any public/accidental access to restricted tables
REVOKE ALL ON cause_analysis FROM industry_readonly;
REVOKE ALL ON corrective_actions FROM industry_readonly;
REVOKE ALL ON production_entries FROM industry_readonly;
REVOKE ALL ON blasting_events FROM industry_readonly;
