monitor = peripheral.wrap("back")
diskdrive = peripheral.wrap("bottom")
os.loadAPI("encryptApi")
EncPassword = "Qx7bz7qCpamJcbUqgSE4" --I know you can see this and i do not care
ownerdiscord = "Kennu#8992"

term.clear()
term.setCursorPos(0,0)
monitor.setTextColor(colors.white)
monitor.setBackgroundColor(colors.red)
monitor.clear()
os.sleep(0.1)
monitor.setBackgroundColor(colors.black)
monitor.clear()

--[[ Count the lines
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

function error(errorCode)
    monitor.setBackgroundColor(colors.blue)
    monitor.setTextColor(colors.white)
    monitor.clear()
    monitor.setCursorPos(2,5)
    monitor.write("ERROR: ".. errorCode)
    monitor.setCursorPos(2,7)
    monitor.write("This is not your")
    monitor.setCursorPos(2,8)
    monitor.write("fault")
    monitor.setCursorPos(2,10)
    monitor.write("Please contact")
    monitor.setCursorPos(2,11)
    monitor.setTextColor(colors.lime)
    monitor.write("Kennu#8992")
    while true do
        local event, button, x, y = os.pullEvent( "monitor_touch" )
        start()
        break
    end
end

function makeCard()
    diskdrive.setDiskLabel("Floppy Disk")
    if diskdrive.isDiskPresent() == false then
        error("NO_DISKS")
    else
        print("Making new card!")
        local deleteList = fs.find("disk/*")
        print("Deleting ".. textutils.serialize(deleteList))
        for k, v in pairs(deleteList) do
            fs.delete(v)
        end
        print("Formatting Card.")
        local file = encryptApi.encrypt(0, EncPassword)
        local openFile = fs.open("disk/Data", "w")
        openFile.write(file)
        openFile.close()
        print("Formatting complete. Adding Label")
        diskdrive.setDiskLabel("Casino Card")
        print("Done. Ejecting Disk!")
        print("-------------------------------------")
        diskdrive.ejectDisk()
        monitor.setBackgroundColor(colors.black)
        monitor.setTextColor(colors.white)
        monitor.clear()
        monitor.setCursorPos(4,9)
        monitor.write("Please wait!")
        os.sleep(5)
        start()
    end 
end

function start()
    monitor.setBackgroundColor(colors.black)
    monitor.setTextColor(colors.white)
    monitor.clear()
    monitor.setBackgroundColor(colors.gray)
    monitor.setCursorPos(3, 8)
    monitor.write("              ")
    monitor.setCursorPos(3, 9)
    monitor.write("   New card   ")
    monitor.setCursorPos(3, 10)
    monitor.write("              ")

    while true do
        local event, button, x, y = os.pullEvent( "monitor_touch" )
        
        --New card button 
        if x > 2 and x < 17 then
            if y > 7 and y < 11 then
                makeCard()
                break
            end
        end
      end
end

start()
