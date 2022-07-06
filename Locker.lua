monitor = peripheral.wrap("right")

term.clear()
term.setCursorPos(1, 1)
monitor.setBackgroundColor(colors.red)
monitor.clear()
os.sleep(0.1)
monitor.setBackgroundColor(colors.black)
monitor.setTextColor(colors.white)
monitor.clear()
monitor.setCursorPos(0, 0)

--[[
    for i = 0,100,1 
    do 
        monitor.setCursorPos(1, i)
        monitor.write(tostring(i))
    end
    for i = 0,100,1 
    do 
        monitor.setCursorPos(i, 1)
        monitor.write(tostring(i))
    end
--]]

function toboolean(str)
    local bool = false
    if str == "true" then
        bool = true
    end
    return bool
end


if fs.exists("isLocked.dat") then
    openFile = fs.open("isLocked.dat", "r")
    isLocked = toboolean(openFile.readAll())
    openFile.close()
elseif fs.exists("isLocked.dat") == false then
    openFile = fs.open("isLocked.dat", "w")
    openFile.write()
    openFile.close()
end

if fs.exists("pin.dat") then
    openFile = fs.open("pin.dat", "r")
    newCode = openFile.readAll()
    openFile.close()
elseif fs.exists("pin.dat") == false then
    openFile = fs.open("pin.dat", "w")
    openFile.write()
    openFile.close()
    print("First time setup complete. Restarting!")
    os.sleep(3)
    os.reboot()
end


function start()
    --[[
        monitor.setBackgroundColor(colors.black)
        monitor.setTextColor(colors.white)
        monitor.clear()
    --]]
    term.setTextColor(colors.orange)
    print("The lock status is:")
    if isLocked == true then
        term.setTextColor(colors.red)
        print("Locked")
    else
        term.setTextColor(colors.green)
        print("Unlocked")
    end
    term.setTextColor(colors.white)
    monitor.setCursorPos(1, 1)
    monitor.write("     ")
    monitor.setBackgroundColor(colors.gray)
    monitor.setCursorPos(1, 3)
    monitor.write("123")
    monitor.setCursorPos(1, 4)
    monitor.write("456")
    monitor.setCursorPos(1, 5)
    monitor.write("789")
    monitor.setBackgroundColor(colors.red)
    monitor.setCursorPos(4, 5)
    monitor.write("D")
    monitor.setBackgroundColor(colors.black)
    InsertedCode = ""
    while true do
        if isLocked == true then
            redstone.setOutput("top", true)
            openFile = fs.open("isLocked.dat", "w")
            openFile.write(true)
            openFile.close()
        else
            redstone.setOutput("top", false)
            openFile = fs.open("isLocked.dat", "w")
            openFile.write(false)
            openFile.close()
        end
        if newCode == nil then
            newCode = 0
        end
        local event, button, x, y = os.pullEvent( "monitor_touch" )
        if x == 1 and y == 3 then
            InsertedCode = InsertedCode.. "1"
        end
        if x == 1 and y == 4 then
            InsertedCode = InsertedCode.. "4"
        end
        if x == 1 and y == 5 then
            InsertedCode = InsertedCode.. "7"
        end
        if x == 2 and y == 3 then
            InsertedCode = InsertedCode.. "2"
        end
        if x == 2 and y == 4 then
            InsertedCode = InsertedCode.. "5"
        end
        if x == 2 and y == 5 then
            InsertedCode = InsertedCode.. "8"
        end
        if x == 3 and y == 3 then
            InsertedCode = InsertedCode.. "3"
        end
        if x == 3 and y == 4 then
            InsertedCode = InsertedCode.. "6"
        end
        if x == 3 and y == 5 then
            InsertedCode = InsertedCode.. "9"
        end
        if x == 4 and y == 5 then
            InsertedCode = InsertedCode:sub(1, -2)
        end
        if #InsertedCode > 3 then
            print(InsertedCode)
            if InsertedCode == "9568" then
                print("------------------Master override------------------")
                if isLocked == true then
                    isLocked = false
                else
                    isLocked = true
                end
                print("The last used password is: ".. newCode)
                start()
            end
            if newCode == InsertedCode then
                print("unlocked")
                isLocked = false
                newCode = 0
                openFile = fs.open("pin.dat", "w")
                openFile.write(newCode)
                openFile.close()
                start()
            end
            if isLocked == false then
                newCode = InsertedCode
                print(newCode)
                isLocked = true
                print("locked")
                openFile = fs.open("pin.dat", "w")
                openFile.write(newCode)
                openFile.close()
            end
            InsertedCode = ""
            monitor.setCursorPos(1, 1)
            monitor.write("     ")
        end
        monitor.setCursorPos(1, 1)
        monitor.write(string.gsub(InsertedCode, "%d", "*").. "         ")
    end
end

start()