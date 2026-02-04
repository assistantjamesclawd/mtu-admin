-- Inspections schema for Mountain Time Utah admin

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  inspector_name TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  inspection_type TEXT DEFAULT 'routine',
  
  -- Interior checklist (stored as JSONB for flexibility)
  interior_checklist JSONB DEFAULT '{}',
  
  -- Exterior checklist
  exterior_checklist JSONB DEFAULT '{}',
  
  -- Issues found
  issues JSONB DEFAULT '[]',
  
  -- Property notes
  notes TEXT,
  
  -- Overall condition
  overall_condition TEXT DEFAULT 'good',
  
  -- Status
  status TEXT DEFAULT 'completed',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspection photos/attachments
CREATE TABLE IF NOT EXISTS inspection_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'photo' or 'video'
  caption TEXT,
  issue_index INTEGER, -- which issue this attachment relates to (nullable for general)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inspections_property ON inspections(property_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date DESC);
CREATE INDEX IF NOT EXISTS idx_inspection_attachments_inspection ON inspection_attachments(inspection_id);

-- RLS Policies (enable as needed)
-- ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE inspection_attachments ENABLE ROW LEVEL SECURITY;
