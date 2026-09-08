# Load repo-root .env without clobbering vars already in the environment.
# Appfile is evaluated before Fastfile, so Apple ID must be available here.
root_env = File.expand_path("../../../../.env", __FILE__)
if File.exist?(root_env)
  File.foreach(root_env) do |line|
    stripped = line.strip
    next if stripped.empty? || stripped.start_with?("#")

    key, value = stripped.split("=", 2)
    next if key.nil? || value.nil?

    key = key.strip
    value = value.strip.gsub(/\A['"]|['"]\z/, "")
    ENV[key] = value if ENV[key].to_s.empty?
  end
end
