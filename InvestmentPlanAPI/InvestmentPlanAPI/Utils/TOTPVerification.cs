using System;
using System.Security.Cryptography;
using System.Text;

namespace InvestmentPlanAPI.Utils
{
    public static class TOTPVerification
    {
       
        public static string GenerateOtp(string mobile)
        {
            if (string.IsNullOrEmpty(mobile))
                throw new ArgumentNullException(nameof(mobile));

          
            var key = Encoding.UTF8.GetBytes(mobile);

            var timestep = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / 120; // 120 sec = 2 mins
            var timestepBytes = BitConverter.GetBytes(timestep);

            if (BitConverter.IsLittleEndian)
                Array.Reverse(timestepBytes);

            using (var hmac = new HMACSHA1(key))
            {
                var hash = hmac.ComputeHash(timestepBytes);
                int offset = hash[hash.Length - 1] & 0x0F;

                int binary =
                    ((hash[offset] & 0x7F) << 24) |
                    ((hash[offset + 1] & 0xFF) << 16) |
                    ((hash[offset + 2] & 0xFF) << 8) |
                    (hash[offset + 3] & 0xFF);

                int otp = binary % 1000000; 
                return otp.ToString("D6"); 
            }
        }

        // Verify OTP for given mobile number
        public static bool VerifyOtp(string mobile, string inputOtp)
        {
            var validOtp = GenerateOtp(mobile);
            Console.WriteLine($"input OTP : {inputOtp} Valid OTP : {validOtp}");
            return validOtp == inputOtp;
        }
    }
}

