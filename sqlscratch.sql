SELECT
    handle,
    name,
    description,
    num_employees,
    logo_url

    FROM companies
    WHERE name ILIKE '%wo%'
    ORDER BY name