SELECT
    handle,
    name,
    description,
    num_employees,
    logo_url

    FROM companies
    WHERE name ILIKE '%wo%' AND employees > 5, AND employees < 30
    ORDER BY name


