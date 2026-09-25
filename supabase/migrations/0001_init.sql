-- Extension pour la recherche texte
create extension if not exists pg_trgm;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text not null,
  prep_time_minutes int not null default 0,
  cook_time_minutes int not null default 0,
  difficulty text not null check (difficulty in ('facile','moyen','difficile')),
  diets text[] not null default '{}',
  ingredients jsonb not null default '[]',
  ingredient_names text[] generated always as (
    array(select jsonb_array_elements(ingredients) ->> 'name')
  ) stored,
  steps jsonb not null default '[]',
  nutrition jsonb not null default '{}',
  is_premium boolean not null default false,
  is_recipe_of_the_day boolean not null default false,
  tags text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists recipes_title_trgm_idx on public.recipes using gin (title gin_trgm_ops);
create index if not exists recipes_diets_idx on public.recipes using gin (diets);
create index if not exists recipes_ingredient_names_idx on public.recipes using gin (ingredient_names);

alter table public.recipes enable row level security;

create policy "Recipes are readable by everyone"
  on public.recipes for select
  using (true);

-- Table profils utilisateurs, alignée sur auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  diets text[] not null default '{classique}',
  dark_mode boolean not null default false,
  language text not null default 'fr',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-création du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Autocomplétion d'ingrédients pour la recherche
create or replace function public.autocomplete_ingredients(search_term text)
returns text[] as $$
  select array_agg(distinct name)
  from (
    select unnest(ingredient_names) as name
    from public.recipes
  ) t
  where name ilike search_term || '%'
  limit 10;
$$ language sql stable;
