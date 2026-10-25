using System;
using System.Collections.Generic;
using System.IO;
using System.Management;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

namespace ITHelpdeskUSBAgent
{
    public class UsbDeviceRecord
    {
        public string DeviceId { get; set; }
        public string DeviceName { get; set; }
        public string Vendor { get; set; }
        public string SerialNumber { get; set; }
        public string DeviceType { get; set; }
        public string DriveLetter { get; set; }
        public string VolumeName { get; set; }
    }

    public class AgentConfig
    {
        public string serverUrl { get; set; }
    }

    class Program
    {
        private static string ServerBaseUrl = "http://192.168.1.16:5000";
        private static readonly string ConfigFilePath = Path.Combine(
            AppDomain.CurrentDomain.BaseDirectory,
            "agent-config.json"
        );
        private static readonly string Hostname = Environment.MachineName;
        private static readonly string OsUsername = Environment.UserName;
        private static string LocalIp = "127.0.0.1";
        private static readonly Dictionary<string, UsbDeviceRecord> ConnectedDevices =
            new Dictionary<string, UsbDeviceRecord>(StringComparer.OrdinalIgnoreCase);
        private static readonly JavaScriptSerializer JsonSerializer = new JavaScriptSerializer();
        private static int SimulatedCounter = 1;

        static void Main(string[] args)
        {
            try
            {
                Console.OutputEncoding = Encoding.UTF8;
                Console.InputEncoding = Encoding.UTF8;
            }
            catch { }

            Console.Title = "IT Helpdesk - Endpoint USB Security Agent (v1.0.0)";
            LocalIp = DetectLocalIpv4();

            PrintBanner();
            InitializeServerConnection(args);

            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("\n[*] Đang quét danh sách thiết bị USB hiện tại trên máy...");
            Console.ResetColor();

            // Quét danh sách thiết bị USB ban đầu và gửi các thiết bị lưu trữ đang cắm lên Server
            Dictionary<string, UsbDeviceRecord> initialDevices = ScanCurrentUsbDevices();
            foreach (var kvp in initialDevices)
            {
                ConnectedDevices[kvp.Key] = kvp.Value;
                // Tự động báo cáo các ổ đĩa USB Storage đang cắm khi khởi động Agent
                if (kvp.Value.DeviceType == "storage")
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine(
                        "  -> Phát hiện USB đang cắm sẵn: {0} ({1})",
                        kvp.Value.DeviceName,
                        kvp.Value.DriveLetter ?? "USB"
                    );
                    Console.ResetColor();
                    SendUsbEventToServer(kvp.Value, "connected");
                }
            }

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine(
                "[✓] Đã ghi nhận {0} thiết bị ngoại vi USB nền. Đang lắng nghe sự kiện cắm/rút theo thời gian thực...",
                ConnectedDevices.Count
            );
            Console.ResetColor();
            PrintHotkeysHelp();

            // Vòng lặp lắng nghe sự kiện cắm/rút USB & phím tắt
            while (true)
            {
                try
                {
                    if (Console.KeyAvailable)
                    {
                        ConsoleKeyInfo keyInfo = Console.ReadKey(true);
                        if (keyInfo.Key == ConsoleKey.Q)
                        {
                            Console.WriteLine("\n[!] Đang dừng USB Security Agent...");
                            break;
                        }
                        else if (keyInfo.Key == ConsoleKey.T)
                        {
                            TriggerSimulatedUsbEvent();
                        }
                        else if (keyInfo.Key == ConsoleKey.S)
                        {
                            SyncAllConnectedUsbToServer();
                        }
                        else if (keyInfo.Key == ConsoleKey.C)
                        {
                            PromptForServerUrl();
                        }
                    }

                    PollUsbChanges();
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.DarkGray;
                    Console.WriteLine("[Debug] Lỗi chu kỳ quét: " + ex.Message);
                    Console.ResetColor();
                }

                Thread.Sleep(1500);
            }
        }

        private static void PrintBanner()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine("========================================================================");
            Console.WriteLine("       IT HELPDESK - ENDPOINT USB SECURITY & DLP AGENT (v1.0.0)         ");
            Console.WriteLine("   Giám sát cắm/rút thiết bị ngoại vi USB & Cảnh báo Realtime lên IT   ");
            Console.WriteLine("========================================================================");
            Console.ResetColor();
            Console.WriteLine("  • Tên máy trạm (Hostname) : {0}", Hostname);
            Console.WriteLine("  • Người dùng Windows      : {0}", OsUsername);
            Console.WriteLine("  • Địa chỉ IP LAN máy trạm : {0}", LocalIp);
            Console.WriteLine("------------------------------------------------------------------------");
        }

        private static void PrintHotkeysHelp()
        {
            Console.WriteLine("------------------------------------------------------------------------");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("  PHÍM TẮT ĐIỀU KHIỂN NHANH:");
            Console.WriteLine("   [T] Giả lập cắm thiết bị USB mới (Dùng để Test cảnh báo Realtime)");
            Console.WriteLine("   [S] Đồng bộ toàn bộ thiết bị USB đang cắm trên máy lên Server");
            Console.WriteLine("   [C] Đổi địa chỉ IP máy chủ Server (Khi chuyển mạng LAN / Wi-Fi)");
            Console.WriteLine("   [Q] Thoát chương trình Agent");
            Console.ResetColor();
            Console.WriteLine("------------------------------------------------------------------------\n");
        }

        private static string NormalizeServerUrl(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            string s = raw.Trim().TrimEnd('/');
            if (!s.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
                !s.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                if (!s.Contains(":"))
                {
                    s = "http://" + s + ":5000";
                }
                else
                {
                    s = "http://" + s;
                }
            }
            if (s.EndsWith("/api", StringComparison.OrdinalIgnoreCase))
            {
                s = s.Substring(0, s.Length - 4);
            }
            return s;
        }

        private static void InitializeServerConnection(string[] args)
        {
            List<string> candidates = new List<string>();

            if (args != null && args.Length > 0 && !string.IsNullOrWhiteSpace(args[0]))
            {
                candidates.Add(NormalizeServerUrl(args[0]));
            }

            if (File.Exists(ConfigFilePath))
            {
                try
                {
                    string json = File.ReadAllText(ConfigFilePath, Encoding.UTF8);
                    AgentConfig cfg = JsonSerializer.Deserialize<AgentConfig>(json);
                    if (cfg != null && !string.IsNullOrWhiteSpace(cfg.serverUrl))
                    {
                        string normalized = NormalizeServerUrl(cfg.serverUrl);
                        if (!candidates.Contains(normalized))
                        {
                            candidates.Add(normalized);
                        }
                    }
                }
                catch { }
            }

            string[] defaults = new string[]
            {
                "http://192.168.1.16:5000",
                "http://192.168.1.6:5000",
                "http://127.0.0.1:5000"
            };

            foreach (string d in defaults)
            {
                if (!candidates.Contains(d)) candidates.Add(d);
            }

            Console.WriteLine("[*] Đang kiểm tra các địa chỉ máy chủ đã lưu...");
            foreach (string candidate in candidates)
            {
                if (string.IsNullOrEmpty(candidate)) continue;
                Console.Write("    Thử kết nối tới {0} ... ", candidate);
                if (PingServer(candidate))
                {
                    ServerBaseUrl = candidate;
                    SaveConfig(ServerBaseUrl);
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("THÀNH CÔNG!");
                    Console.ResetColor();
                    return;
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.DarkGray;
                    Console.WriteLine("Không phản hồi");
                    Console.ResetColor();
                }
            }

            // Nếu các IP cũ không phản hồi (do đổi mạng Wi-Fi / Hotspot điện thoại),
            // TỰ ĐỘNG QUÉT TOÀN BỘ DẢI MẠNG (Auto Subnet Sweep)
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("\n[*] Phát hiện đổi mạng Wi-Fi/Hotspot! Đang tự động quét toàn mạng để tìm máy Server...");
            Console.ResetColor();

            string discoveredUrl = AutoDiscoverServerOnSubnet(LocalIp);
            if (!string.IsNullOrEmpty(discoveredUrl))
            {
                ServerBaseUrl = discoveredUrl;
                SaveConfig(ServerBaseUrl);
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n[✓] ĐÃ TỰ ĐỘNG TÌM THẤY VÀ KẾT NỐI TỚI SERVER: {0}", ServerBaseUrl);
                Console.ResetColor();
                return;
            }

            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("\n[!] Không thể tự động tìm thấy Server trên dải mạng hiện tại.");
            Console.ResetColor();
            PromptForServerUrl();
        }

        private static string AutoDiscoverServerOnSubnet(string localIp)
        {
            if (string.IsNullOrEmpty(localIp) || localIp == "127.0.0.1") return null;

            int lastDot = localIp.LastIndexOf('.');
            if (lastDot < 0) return null;
            string prefix = localIp.Substring(0, lastDot + 1); // VD: "192.168.43." hoặc "172.20.10."

            string foundUrl = null;
            object lockObj = new object();

            Console.Write("    Đang quét nhanh 254 IP trong dải {0}* ", prefix);

            // Quét song song đa luồng để hoàn thành trong 1-2 giây
            System.Threading.Tasks.Parallel.For(1, 255, new System.Threading.Tasks.ParallelOptions { MaxDegreeOfParallelism = 40 }, (i, state) =>
            {
                if (foundUrl != null)
                {
                    state.Stop();
                    return;
                }

                string candidateIp = prefix + i;
                if (candidateIp == localIp) return; // Bỏ qua IP chính mình

                string testUrl = "http://" + candidateIp + ":5000";
                try
                {
                    HttpWebRequest req = (HttpWebRequest)WebRequest.Create(testUrl + "/api/usb/agent-ping");
                    req.Method = "GET";
                    req.Timeout = 800; // 800ms phản hồi trong mạng LAN
                    req.ReadWriteTimeout = 800;

                    using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                    {
                        if (resp.StatusCode == HttpStatusCode.OK)
                        {
                            lock (lockObj)
                            {
                                if (foundUrl == null)
                                {
                                    foundUrl = testUrl;
                                    state.Stop();
                                }
                            }
                        }
                    }
                }
                catch { }
            });

            Console.WriteLine();
            return foundUrl;
        }

        private static void PromptForServerUrl()
        {
            while (true)
            {
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.Write("\n👉 Nhập địa chỉ IP của máy chạy Server (VD: 192.168.1.16 hoặc 127.0.0.1): ");
                Console.ResetColor();
                string input = Console.ReadLine();
                string candidate = NormalizeServerUrl(input);
                if (string.IsNullOrEmpty(candidate))
                {
                    continue;
                }

                Console.Write("    Đang kiểm tra kết nối tới {0} ... ", candidate);
                if (PingServer(candidate))
                {
                    ServerBaseUrl = candidate;
                    SaveConfig(ServerBaseUrl);
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("KẾT NỐI THÀNH CÔNG!");
                    Console.ResetColor();
                    break;
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("THẤT BẠI! Hãy đảm bảo máy Server đang bật backend ở cổng 5000.");
                    Console.ResetColor();
                }
            }
        }

        private static void SaveConfig(string url)
        {
            try
            {
                string json = "{\"serverUrl\": \"" + url.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"}";
                File.WriteAllText(ConfigFilePath, json, Encoding.UTF8);
            }
            catch { }
        }

        private static bool PingServer(string baseUrl)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(baseUrl + "/api/usb/agent-ping");
                req.Method = "GET";
                req.Timeout = 2500;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void PollUsbChanges()
        {
            Dictionary<string, UsbDeviceRecord> current = ScanCurrentUsbDevices();

            // Kiểm tra thiết bị mới cắm vào
            foreach (var kvp in current)
            {
                if (!ConnectedDevices.ContainsKey(kvp.Key))
                {
                    ConnectedDevices[kvp.Key] = kvp.Value;
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine(
                        "\n[{0}] 🔌 PHÁT HIỆN CẮM THIẾT BỊ USB MỚI:",
                        DateTime.Now.ToString("HH:mm:ss")
                    );
                    Console.ResetColor();
                    Console.WriteLine("   • Tên thiết bị : {0}", kvp.Value.DeviceName);
                    Console.WriteLine("   • Hãng / Mã ID : {0} ({1})", kvp.Value.Vendor, kvp.Value.DeviceId);
                    if (!string.IsNullOrEmpty(kvp.Value.DriveLetter))
                    {
                        Console.WriteLine("   • Ổ đĩa Mount  : {0} [{1}]", kvp.Value.DriveLetter, kvp.Value.VolumeName);
                    }

                    SendUsbEventToServer(kvp.Value, "connected");
                }
            }

            // Kiểm tra thiết bị vừa rút ra
            List<string> removedKeys = new List<string>();
            foreach (var kvp in ConnectedDevices)
            {
                if (!current.ContainsKey(kvp.Key))
                {
                    removedKeys.Add(kvp.Key);
                }
            }

            foreach (string key in removedKeys)
            {
                UsbDeviceRecord removed = ConnectedDevices[key];
                ConnectedDevices.Remove(key);

                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.WriteLine(
                    "\n[{0}] 📤 PHÁT HIỆN RÚT THIẾT BỊ USB:",
                    DateTime.Now.ToString("HH:mm:ss")
                );
                Console.ResetColor();
                Console.WriteLine("   • Tên thiết bị : {0}", removed.DeviceName);

                SendUsbEventToServer(removed, "disconnected");
            }
        }

        private static void SyncAllConnectedUsbToServer()
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("\n[*] Đang đồng bộ các thiết bị USB đang kết nối lên Server...");
            Console.ResetColor();
            int count = 0;
            foreach (var kvp in ConnectedDevices)
            {
                SendUsbEventToServer(kvp.Value, "connected");
                count++;
            }
            Console.WriteLine("[✓] Đã gửi thông tin {0} thiết bị USB lên Server.", count);
        }

        private static void TriggerSimulatedUsbEvent()
        {
            string[] sampleNames = new string[]
            {
                "Kingston DataTraveler Exodia 64GB",
                "SanDisk Extreme Go USB 3.2 128GB",
                "Samsung BAR Plus USB Flash Drive 256GB",
                "Unknown USB Mass Storage (Unencrypted DLP Alert)"
            };
            string[] sampleVendors = new string[]
            {
                "Kingston Technology (VID_0951)",
                "SanDisk Corp (VID_0781)",
                "Samsung Electronics (VID_090C)",
                "Generic USB Vendor (VID_FFFF)"
            };

            int idx = (SimulatedCounter - 1) % sampleNames.Length;
            string serial = "SIM" + DateTime.Now.ToString("MMddHHmmss") + SimulatedCounter;
            SimulatedCounter++;

            UsbDeviceRecord sim = new UsbDeviceRecord
            {
                DeviceId = "USBSTOR\\DISK&VEN_SIMULATED&PROD_FLASH\\" + serial,
                DeviceName = sampleNames[idx],
                Vendor = sampleVendors[idx],
                SerialNumber = serial,
                DeviceType = "storage",
                DriveLetter = "F:",
                VolumeName = "USB_NHANVIEN (64.0 GB)"
            };

            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(
                "\n[{0}] 🧪 [GIẢ LẬP TEST] Nhân viên vừa cắm USB mới: {1}",
                DateTime.Now.ToString("HH:mm:ss"),
                sim.DeviceName
            );
            Console.ResetColor();

            SendUsbEventToServer(sim, "connected");
        }

        private static void SendUsbEventToServer(UsbDeviceRecord device, string eventType)
        {
            try
            {
                var payload = new Dictionary<string, object>
                {
                    { "deviceId", device.DeviceId },
                    { "deviceName", device.DeviceName },
                    { "vendor", device.Vendor ?? "Unknown USB Vendor" },
                    { "serialNumber", device.SerialNumber },
                    { "deviceType", device.DeviceType ?? "other_usb" },
                    { "driveLetter", device.DriveLetter },
                    { "volumeName", device.VolumeName },
                    { "eventType", eventType },
                    { "hostname", Hostname },
                    { "osUsername", OsUsername },
                    { "ipAddress", LocalIp },
                    { "agentVersion", "1.0.0-win64" }
                };

                string jsonBody = JsonSerializer.Serialize(payload);
                byte[] bytes = Encoding.UTF8.GetBytes(jsonBody);

                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(ServerBaseUrl + "/api/usb/agent-event");
                req.Method = "POST";
                req.ContentType = "application/json; charset=utf-8";
                req.ContentLength = bytes.Length;
                req.Timeout = 5000;

                using (Stream reqStream = req.GetRequestStream())
                {
                    reqStream.Write(bytes, 0, bytes.Length);
                }

                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                using (StreamReader reader = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
                {
                    string responseText = reader.ReadToEnd();
                    var parsed = JsonSerializer.DeserializeObject(responseText) as Dictionary<string, object>;
                    string policyStatus = "unverified";
                    string message = "Đã gửi thông báo lên Server.";

                    if (parsed != null && parsed.ContainsKey("data"))
                    {
                        var dataObj = parsed["data"] as Dictionary<string, object>;
                        if (dataObj != null)
                        {
                            if (dataObj.ContainsKey("policyStatus") && dataObj["policyStatus"] != null)
                                policyStatus = dataObj["policyStatus"].ToString();
                            if (dataObj.ContainsKey("policyMessage") && dataObj["policyMessage"] != null)
                                message = dataObj["policyMessage"].ToString();
                        }
                    }

                    if (policyStatus == "blocked")
                    {
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("   🚨 [PHẢN HỒI TỪ SERVER - BỊ CHẶN]: " + message);
                        Console.ResetColor();
                        try { Console.Beep(1200, 450); } catch { }
                    }
                    else if (policyStatus == "trusted")
                    {
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("   ✅ [PHẢN HỒI TỪ SERVER - HỢP LỆ]: " + message);
                        Console.ResetColor();
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine("   ⚠️ [PHẢN HỒI TỪ SERVER - CẢNH BÁO IT]: " + message);
                        Console.ResetColor();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("   [x] Không thể gửi sự kiện lên Server ({0}): {1}", ServerBaseUrl, ex.Message);
                Console.ResetColor();
            }
        }

        private static Dictionary<string, UsbDeviceRecord> ScanCurrentUsbDevices()
        {
            Dictionary<string, UsbDeviceRecord> results =
                new Dictionary<string, UsbDeviceRecord>(StringComparer.OrdinalIgnoreCase);

            // 1. Quét ổ đĩa USB Storage (Win32_DiskDrive có InterfaceType='USB') để lấy cả ký tự ổ đĩa E:, F:
            try
            {
                using (var searcher = new ManagementObjectSearcher(
                    "SELECT DeviceID, PNPDeviceID, Model, Caption, Manufacturer, SerialNumber, Size FROM Win32_DiskDrive WHERE InterfaceType='USB'"))
                {
                    foreach (ManagementObject drive in searcher.Get())
                    {
                        string pnpId = Convert.ToString(drive["PNPDeviceID"] ?? "").Trim();
                        if (string.IsNullOrEmpty(pnpId)) continue;

                        string name = Convert.ToString(drive["Caption"] ?? drive["Model"] ?? "USB Storage Drive").Trim();
                        string vendor = Convert.ToString(drive["Manufacturer"] ?? "USB Storage Vendor").Trim();
                        if (vendor.Equals("(Standard disk drives)", StringComparison.OrdinalIgnoreCase))
                        {
                            vendor = ExtractVendorFromPnpId(pnpId, name);
                        }
                        string serial = Convert.ToString(drive["SerialNumber"] ?? "").Trim();
                        if (string.IsNullOrEmpty(serial))
                        {
                            serial = ExtractSerialFromPnpId(pnpId);
                        }

                        string driveLetter = null;
                        string volumeInfo = null;
                        GetDriveLettersAndVolume(drive, out driveLetter, out volumeInfo);

                        results[pnpId] = new UsbDeviceRecord
                        {
                            DeviceId = pnpId,
                            DeviceName = name,
                            Vendor = vendor,
                            SerialNumber = serial,
                            DeviceType = "storage",
                            DriveLetter = driveLetter,
                            VolumeName = volumeInfo
                        };
                    }
                }
            }
            catch { }

            // 2. Quét các thiết bị USB ngoại vi khác từ Win32_PnPEntity
            try
            {
                using (var searcher = new ManagementObjectSearcher(
                    "SELECT PNPDeviceID, Name, Caption, Manufacturer, Service, PNPClass FROM Win32_PnPEntity WHERE PNPDeviceID LIKE 'USB%'"))
                {
                    foreach (ManagementObject entity in searcher.Get())
                    {
                        string pnpId = Convert.ToString(entity["PNPDeviceID"] ?? "").Trim();
                        if (string.IsNullOrEmpty(pnpId) || results.ContainsKey(pnpId)) continue;

                        string upperId = pnpId.ToUpperInvariant();
                        string name = Convert.ToString(entity["Name"] ?? entity["Caption"] ?? "").Trim();
                        string service = Convert.ToString(entity["Service"] ?? "").Trim().ToUpperInvariant();
                        string pnpClass = Convert.ToString(entity["PNPClass"] ?? "").Trim().ToUpperInvariant();

                        // Bỏ qua các Hub hệ thống nội bộ hoặc Composite container trùng lặp
                        if (upperId.StartsWith("USB\\ROOT_HUB") ||
                            service == "USBHUB" ||
                            service == "USBHUB3" ||
                            service == "USBCCGP" ||
                            name.IndexOf("Root Hub", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            name.IndexOf("Generic USB Hub", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            name.IndexOf("Composite Device", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            name.IndexOf("Host Controller", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            continue;
                        }

                        string deviceType = "other_usb";
                        if (upperId.StartsWith("USBSTOR\\") || service == "USBSTOR" || pnpClass == "DISKDRIVE")
                        {
                            deviceType = "storage";
                        }
                        else if (pnpClass == "HIDCLASS" || pnpClass == "KEYBOARD" || pnpClass == "MOUSE" || service == "HIDUSB")
                        {
                            deviceType = "input_hid";
                        }
                        else if (pnpClass == "WPD" || service.Contains("WUDFWPDMTP") || name.IndexOf("MTP", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            deviceType = "mobile_mtp";
                        }
                        else if (pnpClass == "MEDIA" || pnpClass == "CAMERA" || pnpClass == "IMAGE" || service == "USBAUDIO" || service == "USBVIDEO")
                        {
                            deviceType = "audio_video";
                        }

                        string vendor = Convert.ToString(entity["Manufacturer"] ?? "").Trim();
                        if (string.IsNullOrEmpty(vendor) || vendor.StartsWith("("))
                        {
                            vendor = ExtractVendorFromPnpId(pnpId, name);
                        }

                        results[pnpId] = new UsbDeviceRecord
                        {
                            DeviceId = pnpId,
                            DeviceName = string.IsNullOrEmpty(name) ? "USB Peripheral Device" : name,
                            Vendor = vendor,
                            SerialNumber = ExtractSerialFromPnpId(pnpId),
                            DeviceType = deviceType,
                            DriveLetter = null,
                            VolumeName = null
                        };
                    }
                }
            }
            catch { }

            return results;
        }

        private static void GetDriveLettersAndVolume(ManagementObject diskDrive, out string driveLetter, out string volumeInfo)
        {
            driveLetter = null;
            volumeInfo = null;
            try
            {
                foreach (ManagementObject partition in diskDrive.GetRelated("Win32_DiskPartition"))
                {
                    foreach (ManagementObject logical in partition.GetRelated("Win32_LogicalDisk"))
                    {
                        string letter = Convert.ToString(logical["DeviceID"] ?? "").Trim();
                        string volName = Convert.ToString(logical["VolumeName"] ?? "").Trim();
                        ulong sizeBytes = 0;
                        if (logical["Size"] != null)
                        {
                            ulong.TryParse(logical["Size"].ToString(), out sizeBytes);
                        }
                        double sizeGb = sizeBytes > 0 ? Math.Round(sizeBytes / (1024.0 * 1024.0 * 1024.0), 1) : 0;

                        if (!string.IsNullOrEmpty(letter))
                        {
                            driveLetter = letter;
                            string label = string.IsNullOrEmpty(volName) ? "USB_DRIVE" : volName;
                            volumeInfo = sizeGb > 0 ? string.Format("{0} ({1} GB)", label, sizeGb) : label;
                            return;
                        }
                    }
                }
            }
            catch { }
        }

        private static string ExtractVendorFromPnpId(string pnpId, string fallbackName)
        {
            if (string.IsNullOrEmpty(pnpId)) return "Unknown Vendor";
            int venIdx = pnpId.IndexOf("VEN_", StringComparison.OrdinalIgnoreCase);
            if (venIdx >= 0)
            {
                string sub = pnpId.Substring(venIdx + 4);
                int amp = sub.IndexOf('&');
                if (amp > 0) return sub.Substring(0, amp);
            }
            int vidIdx = pnpId.IndexOf("VID_", StringComparison.OrdinalIgnoreCase);
            if (vidIdx >= 0 && vidIdx + 8 <= pnpId.Length)
            {
                return pnpId.Substring(vidIdx, 8).ToUpperInvariant();
            }
            if (!string.IsNullOrEmpty(fallbackName))
            {
                string[] parts = fallbackName.Split(' ');
                if (parts.Length > 0) return parts[0];
            }
            return "USB Device Vendor";
        }

        private static string ExtractSerialFromPnpId(string pnpId)
        {
            if (string.IsNullOrEmpty(pnpId)) return null;
            string[] segments = pnpId.Split('\\');
            if (segments.Length >= 3)
            {
                return segments[segments.Length - 1].Replace("&0", "");
            }
            return null;
        }

        private static string DetectLocalIpv4()
        {
            try
            {
                foreach (NetworkInterface ni in NetworkInterface.GetAllNetworkInterfaces())
                {
                    if (ni.OperationalStatus != OperationalStatus.Up ||
                        ni.NetworkInterfaceType == NetworkInterfaceType.Loopback)
                    {
                        continue;
                    }

                    foreach (UnicastIPAddressInformation ip in ni.GetIPProperties().UnicastAddresses)
                    {
                        if (ip.Address.AddressFamily == AddressFamily.InterNetwork)
                        {
                            string addr = ip.Address.ToString();
                            if (!addr.StartsWith("169.254."))
                            {
                                return addr;
                            }
                        }
                    }
                }
            }
            catch { }
            return "127.0.0.1";
        }
    }
}

