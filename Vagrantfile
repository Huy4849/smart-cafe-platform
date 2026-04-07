Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"

  # Dev Environment
  config.vm.define "dev" do |dev|
    dev.vm.hostname = "smartcafe-dev"
    dev.vm.network "private_network", ip: "192.168.56.10"
    dev.vm.provider "virtualbox" do |vb|
      vb.memory = "2048"
      vb.cpus = 2
    end
  end

  # Staging Environment
  config.vm.define "staging" do |staging|
    staging.vm.hostname = "smartcafe-staging"
    staging.vm.network "private_network", ip: "192.168.56.20"
    staging.vm.provider "virtualbox" do |vb|
      vb.memory = "2048"
      vb.cpus = 2
    end
  end
end
