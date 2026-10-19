-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CLIENTE', 'PROPIETARIO', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('NO_INICIADO', 'PENDIENTE_REVISION', 'APROBADO', 'RECHAZADO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE space_category AS ENUM ('CERRADO', 'ABIERTO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE pricing_modality AS ENUM ('HORA', 'DIA', 'MES', 'FLEXIBLE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'PENDIENTE_APROBACION', 
        'APROBADA_POR_PROPIETARIO', 
        'CONFIRMADA_PAGADA', 
        'RECHAZADA', 
        'CANCELADA', 
        'FINALIZADA'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'INICIADO', 
        'EN_CUSTODIA_WEBPAY', 
        'LIBERADO_A_PROPIETARIO', 
        'REEMBOLSADO', 
        'FALLIDO'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLAS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    rut VARCHAR(12) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'CLIENTE' NOT NULL,
    kyc_status kyc_status DEFAULT 'NO_INICIADO' NOT NULL,
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category space_category NOT NULL,
    sub_category VARCHAR(100) NOT NULL,
    surface_m2 NUMERIC(8, 2) NOT NULL,
    capacity_people INTEGER,
    address_street VARCHAR(255) NOT NULL,
    commune VARCHAR(100) NOT NULL,
    region VARCHAR(100) DEFAULT 'Metropolitana' NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    pricing_mode pricing_modality NOT NULL,
    price_per_hour NUMERIC(12, 2),
    price_per_day NUMERIC(12, 2),
    price_per_month NUMERIC(12, 2),
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    is_moderated BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_spaces_location ON spaces USING GIST (location);

CREATE TABLE IF NOT EXISTS space_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS space_amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    amenity_key VARCHAR(50) NOT NULL,
    UNIQUE(space_id, amenity_key)
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status booking_status DEFAULT 'PENDIENTE_APROBACION' NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    purpose TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    platform_commission NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    buy_order VARCHAR(64) UNIQUE NOT NULL,
    session_id VARCHAR(64) NOT NULL,
    tbk_token VARCHAR(255) UNIQUE,
    authorization_code VARCHAR(50),
    card_last_digits VARCHAR(4),
    payment_type VARCHAR(10),
    status payment_status DEFAULT 'INICIADO' NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    transbank_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. DATOS INICIALES (SEED DATA)
INSERT INTO users (id, email, password_hash, first_name, last_name, rut, role, kyc_status)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'propietario@espacioschile.cl',
    '$2b$10$wT8BfZh0E41/6rVf6P2aIeK9hGqXvJmYFkUvOzQyW1rS8gU2mE6z.',
    'Camila',
    'Troncoso',
    '18.765.432-1',
    'PROPIETARIO',
    'APROBADO'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO spaces (
    id, owner_id, title, description, category, sub_category, surface_m2, 
    capacity_people, address_street, commune, location, pricing_mode, price_per_month, is_published, is_moderated
) VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Oficina Administrativa en Parque Logístico Quilicura',
    'Moderna oficina ejecutiva de planta libre ubicada en parque logístico, con piso de alto tráfico y CCTV.',
    'CERRADO',
    'Oficinas Privadas',
    85.00,
    12,
    'Av. Américo Vespucio 1234',
    'Quilicura',
    ST_SetSRID(ST_MakePoint(-70.7314, -33.3646), 4326),
    'MES',
    550000,
    TRUE,
    TRUE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO spaces (
    id, owner_id, title, description, category, sub_category, surface_m2, 
    capacity_people, address_street, commune, location, pricing_mode, price_per_day, is_published, is_moderated
) VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Rooftop Panorámico Nueva Las Condes',
    'Exclusiva terraza en piso 18 con vista a la cordillera, deck de madera y mobiliario lounge exterior.',
    'ABIERTO',
    'Azoteas (Rooftops)',
    180.00,
    80,
    'Rosario Norte 555',
    'Las Condes',
    ST_SetSRID(ST_MakePoint(-70.5672, -33.4042), 4326),
    'DIA',
    380000,
    TRUE,
    TRUE
) ON CONFLICT (id) DO NOTHING;