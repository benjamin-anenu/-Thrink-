-- Fix the execute_sql function to set search_path for security
CREATE OR REPLACE FUNCTION public.execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  clean_query text;
BEGIN
  -- Clean and validate the query
  clean_query := trim(query);
  
  -- Security check: Only allow SELECT statements
  IF NOT (upper(clean_query) LIKE 'SELECT%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed. Query must start with SELECT.';
  END IF;
  
  -- Additional security: Block dangerous keywords
  IF upper(clean_query) ~ '.*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE|GRANT|REVOKE).*' THEN
    RAISE EXCEPTION 'Query contains forbidden keywords. Only SELECT operations are allowed.';
  END IF;
  
  -- Execute the query and return as JSON
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || clean_query || ') t' INTO result;
  
  -- Return empty array if no results
  RETURN COALESCE(result, '[]'::json);
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error information as JSON
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;