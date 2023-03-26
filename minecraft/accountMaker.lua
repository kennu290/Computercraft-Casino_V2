url="http://localhost"

--Checking if we have everything we need
if not fs.exists("apis/json") then
    shell.run("pastebin get 4nRg9CHU apis/json")
    os.reboot()
end

if not peripheral.find("drive") then
    error("Cannot find disk drive. Please make sure it is attached and in the network!")
end

--load json api
os.loadAPI("apis/json")

--setting up perhiperals.
diskDrive = peripheral.find("drive")

function main()
    --Wait for a disk to be inserted
    local event = os.pullEvent("disk")
    --Format the disk. just incase yaknow
    files = fs.list("disk")
    for key,value in pairs(files) do
        fs.delete("./disk/" .. files[key])
    end
    diskDrive.setDiskLabel("Casino card")
    --make http request to server to create new account
    local data = "{}"
    local headers = {["Content-Type"] = "application/json"}

    local response = http.post(url.. "/api/user/create", data, headers)
        
    --if we get a response then save token to variable, if not we print "failed to make post request"
    if response then
        local body = response.readAll()
        obj = json.decode(body)
        response.close()
        openFile = fs.open("disk/casinoData", "w")
        openFile.write(obj.data)
        openFile.close()
        diskDrive.ejectDisk()
        main()
    else
        print("Failed to make POST request")
        local data = '{"alert": "Account creation error"}'
        local headers = {["Content-Type"] = "application/json"}
        http.post(url.. "/api/alerts", data, headers)
    end
end

main()