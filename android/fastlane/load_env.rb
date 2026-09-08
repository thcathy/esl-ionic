# Load .env files without clobbering vars already in the environment.
# Appfile is evaluated before Fastfile, so Play JSON key must be available here.
def load_dotenv(path)
  return unless File.exist?(path)

  File.foreach(path) do |line|
    stripped = line.strip
    next if stripped.empty? || stripped.start_with?("#")

    key, value = stripped.split("=", 2)
    next if key.nil? || value.nil?

    key = key.strip
    value = value.strip.gsub(/\A['"]|['"]\z/, "")
    ENV[key] = value if ENV[key].to_s.empty?
  end
end

load_dotenv(File.expand_path("../../../.env", __FILE__))
load_dotenv(File.expand_path("../.env", __FILE__))
