package com.example.eepyanalyzer

import android.os.Bundle
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

class MainActivity : AppCompatActivity() {
    lateinit var sleepTxt: TextView
    lateinit var ageTxt: TextView
    lateinit var genderTxt: TextView
    lateinit var sleepDurationTxt: TextView
    lateinit var remSleepTxt: TextView
    lateinit var deepSleepTxt: TextView
    lateinit var lightSleepTxt: TextView
    lateinit var awakeningsTxt: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        sleepTxt = findViewById(R.id.sleepTxt)
        ageTxt = findViewById(R.id.AgeTxt)
        genderTxt = findViewById(R.id.GenderTxt)
        sleepDurationTxt = findViewById(R.id.SleepDurationTxt)
        remSleepTxt = findViewById(R.id.RemSleepTxt)
        deepSleepTxt = findViewById(R.id.DeepSleepTxt)
        lightSleepTxt = findViewById(R.id.LightSleepTxt)
        awakeningsTxt = findViewById(R.id.AwakeningsTxt)


        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val tflitemodel = loadModelFile()
        val interpreter = Interpreter(tflitemodel)

        val inputStream = floatArrayOf(20F,1F,8F,20F,20F,60F,1F,1F,1F,1F,3F)
        val output = floatArrayOf(0F)

        val outBuff = floatArrayToBuffer(output)
        val inBuff = floatArrayToBuffer(inputStream)

        interpreter.run(inBuff,outBuff)

        sleepTxt.text = outBuff[0].toString()
    }

    fun floatArrayToBuffer(floatArray: FloatArray): FloatBuffer{
        val byteBuffer = ByteBuffer.allocateDirect(floatArray.size * 4)
        byteBuffer.order(ByteOrder.nativeOrder())
        val floatBuffer = byteBuffer.asFloatBuffer()

        floatBuffer.put(floatArray)
        floatBuffer.position(0)

        return floatBuffer
    }

    private fun loadModelFile(): MappedByteBuffer {
        val fileDescriptor = assets.openFd("converted_model.tflite")
        val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = fileDescriptor.startOffset
        val declaredLength = fileDescriptor.declaredLength
        return fileChannel.map(
            FileChannel.MapMode.READ_ONLY,
            startOffset,
            declaredLength
        )
    }
}