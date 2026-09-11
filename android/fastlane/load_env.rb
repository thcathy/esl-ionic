# Load repo-root .env without clobbering vars already in the environment.
# Appfile is evaluated before Fastfile, so Play JSON key must be available here.
# Fastlane auto-loads android/fastlane/.env; do not duplicate that here (match iOS load_env.rb).
ROOT_DIR = File.expand_path("../../..", __FILE__)

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

def play_json_key_path
  raw = (ENV["GCLOUD_SERVICE_ACCOUNT_KEY"] || ENV["PLAY_STORE_JSON_KEY"]).to_s.strip
  return nil if raw.empty?

  File.expand_path(raw, ROOT_DIR)
end

load_dotenv(File.expand_path("../../../.env", __FILE__))
